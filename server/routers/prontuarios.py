from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date, datetime, time
from ..data.database import get_db
from ..data import models, schemas
from datetime import datetime

router = APIRouter(prefix="/prontuarios", tags=["prontuarios"])


@router.get("/", response_model=List[schemas.Prontuario])
def listar_prontuarios(data_filtro: date = None, status: str = None, db: Session = Depends(get_db)):
    query = db.query(models.Prontuario)
    
    if data_filtro:
        query = query.filter(models.Prontuario.data == data_filtro)
    
    if status:
        query = query.filter(models.Prontuario.status == status)
    
    return query.all()


@router.get("/hoje", response_model=List[dict])
def listar_prontuarios_hoje(db: Session = Depends(get_db)):
    hoje = date.today()
    prontuarios = db.query(models.Prontuario).filter(
        models.Prontuario.data == hoje
    ).all()
    
    resultado = []
    for pront in prontuarios:
        idoso = db.query(models.Idoso).filter(models.Idoso.id == pront.idoso_id).first()
        remedio = db.query(models.Remedio).filter(models.Remedio.id == pront.remedio_id).first()
        
        resultado.append({
            "id": pront.id,
            "idoso_id": pront.idoso_id,
            "idoso_nome": idoso.nome if idoso else "",
            "remedio_id": pront.remedio_id,
            "remedio_nome": remedio.nome if remedio else "",
            "remedio_dosagem": remedio.dosagem if remedio else "",
            "data": pront.data,
            "horario_previsto": str(pront.horario_previsto) if pront.horario_previsto else "00:00:00",
            "horario_realizado": str(pront.horario_realizado) if pront.horario_realizado else None,
            "status": pront.status,
            "observacoes": pront.observacoes
        })
    
    return resultado


@router.post("/gerar-do-dia")
def gerar_prontuarios_do_dia(db: Session = Depends(get_db)):
    hoje = date.today()
    
    # Busca todos os prontuários já existentes para hoje
    prontuarios_existentes = db.query(models.Prontuario).filter(
        models.Prontuario.data == hoje
    ).all()
    
    # Cria um set com as combinações (idoso_id, remedio_id) já existentes
    combinacoes_existentes = {
        (p.idoso_id, p.remedio_id) for p in prontuarios_existentes
    }
    
    idosos = db.query(models.Idoso).all()
    contador = 0
    
    for idoso in idosos:
        for remedio in idoso.remedios:
            # Só cria o prontuário se não existir ainda
            if (idoso.id, remedio.id) not in combinacoes_existentes:
                prontuario = models.Prontuario(
                    idoso_id=idoso.id,
                    remedio_id=remedio.id,
                    data=hoje,
                    horario_previsto=remedio.horario,
                    status="pendente"
                )
                db.add(prontuario)
                contador += 1
    
    db.commit()
    
    total_existentes = len(combinacoes_existentes)
    if contador > 0:
        return {
            "message": f"Prontuários gerados com sucesso! {contador} novos criados, {total_existentes} já existiam.",
            "novos": contador,
            "existentes": total_existentes,
            "total": contador + total_existentes
        }
    else:
        return {
            "message": f"Todos os prontuários já foram gerados. Total: {total_existentes}",
            "novos": 0,
            "existentes": total_existentes,
            "total": total_existentes
        }



@router.post("/", response_model=schemas.Prontuario)
def criar_prontuario(prontuario: schemas.ProntuarioCreate, db: Session = Depends(get_db)):
    db_prontuario = models.Prontuario(**prontuario.dict())
    db.add(db_prontuario)
    db.commit()
    db.refresh(db_prontuario)
    try:
        from server import crud
        # Buscar informações do idoso e remédio
        idoso = db.query(models.Idoso).filter(models.Idoso.id == db_prontuario.idoso_id).first()
        remedio = db.query(models.Remedio).filter(models.Remedio.id == db_prontuario.remedio_id).first()
        
        idoso_nome = idoso.nome if idoso else "Desconhecido"
        remedio_nome = remedio.nome if remedio else "Desconhecido"
        
        # Formatar horário previsto
        horario = db_prontuario.horario_previsto.strftime("%H:%M") if db_prontuario.horario_previsto else "N/A"
        data_formatada = db_prontuario.data.strftime("%d/%m/%Y") if db_prontuario.data else "N/A"
        
        description = f"Prontuário criado para {idoso_nome} - Medicamento: {remedio_nome} - Horário: {horario} ({data_formatada})"
        
        crud.create_audit_log(
            db, 
            datetime.now(), 
            action="Criação de Prontuário", 
            target_table="prontuarios", 
            target_id=db_prontuario.id, 
            description=description
        )
    except Exception:
        pass
    return db_prontuario


@router.put("/{prontuario_id}", response_model=schemas.Prontuario)
def atualizar_prontuario(
    prontuario_id: int, 
    prontuario: schemas.ProntuarioUpdate, 
    db: Session = Depends(get_db)
):
    db_prontuario = db.query(models.Prontuario).filter(
        models.Prontuario.id == prontuario_id
    ).first()
    
    if not db_prontuario:
        raise HTTPException(status_code=404, detail="Prontuário não encontrado")
    
    db_prontuario.status = prontuario.status
    if prontuario.horario_realizado:
        db_prontuario.horario_realizado = prontuario.horario_realizado
    elif prontuario.status == "concluido" and not db_prontuario.horario_realizado:
        db_prontuario.horario_realizado = datetime.now()
    
    if prontuario.observacoes is not None:
        db_prontuario.observacoes = prontuario.observacoes
    
    db.commit()
    db.refresh(db_prontuario)
    try:
        from server import crud
        # Buscar informações do idoso e remédio para log descritivo
        idoso = db.query(models.Idoso).filter(models.Idoso.id == db_prontuario.idoso_id).first()
        remedio = db.query(models.Remedio).filter(models.Remedio.id == db_prontuario.remedio_id).first()
        
        idoso_nome = idoso.nome if idoso else "Desconhecido"
        remedio_nome = remedio.nome if remedio else "Desconhecido"
        
        # Formatar status
        status_texto = {
            "pendente": "Pendente",
            "concluido": "Concluído",
            "atrasado": "Atrasado"
        }.get(db_prontuario.status, db_prontuario.status.capitalize())
        
        # Formatar horário realizado
        horario_info = ""
        if db_prontuario.horario_realizado:
            horario_formatado = db_prontuario.horario_realizado.strftime("%d/%m/%Y às %H:%M")
            horario_info = f" - Realizado em: {horario_formatado}"
        
        description = f"Prontuário de {idoso_nome} atualizado - Medicamento: {remedio_nome} - Status: {status_texto}{horario_info}"
        
        crud.create_audit_log(
            db, 
            datetime.now(), 
            action="Atualização de Prontuário", 
            target_table="prontuarios", 
            target_id=db_prontuario.id, 
            description=description
        )
    except Exception:
        pass
    return db_prontuario


@router.delete("/{prontuario_id}")
def deletar_prontuario(prontuario_id: int, db: Session = Depends(get_db)):
    db_prontuario = db.query(models.Prontuario).filter(
        models.Prontuario.id == prontuario_id
    ).first()
    
    if not db_prontuario:
        raise HTTPException(status_code=404, detail="Prontuário não encontrado")
    
    # Buscar informações antes de deletar
    idoso = db.query(models.Idoso).filter(models.Idoso.id == db_prontuario.idoso_id).first()
    remedio = db.query(models.Remedio).filter(models.Remedio.id == db_prontuario.remedio_id).first()
    
    idoso_nome = idoso.nome if idoso else "Desconhecido"
    remedio_nome = remedio.nome if remedio else "Desconhecido"
    data_formatada = db_prontuario.data.strftime("%d/%m/%Y") if db_prontuario.data else "N/A"
    
    db.delete(db_prontuario)
    db.commit()
    try:
        from server import crud
        description = f"Prontuário removido - Paciente: {idoso_nome} - Medicamento: {remedio_nome} - Data: {data_formatada} (ID: {prontuario_id})"
        
        crud.create_audit_log(
            db, 
            datetime.now(), 
            action="Exclusão de Prontuário", 
            target_table="prontuarios", 
            target_id=prontuario_id, 
            description=description
        )
    except Exception:
        pass
    return {"message": "Prontuário deletado com sucesso"}


@router.get("/pendentes/hoje")
def listar_pendentes_hoje(db: Session = Depends(get_db)):
    hoje = date.today()
    prontuarios = db.query(models.Prontuario).filter(
        models.Prontuario.data == hoje,
        models.Prontuario.status == "pendente"
    ).all()
    
    resultado = []
    for pront in prontuarios:
        idoso = db.query(models.Idoso).filter(models.Idoso.id == pront.idoso_id).first()
        remedio = db.query(models.Remedio).filter(models.Remedio.id == pront.remedio_id).first()
        
        resultado.append({
            "id": pront.id,
            "idoso_nome": idoso.nome if idoso else "",
            "remedio_nome": remedio.nome if remedio else "",
            "remedio_dosagem": remedio.dosagem if remedio else "",
            "horario_previsto": pront.horario_previsto
        })
    
    return resultado
