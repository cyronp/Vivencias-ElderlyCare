from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date, datetime, time
from ..data.database import get_db
from ..data import models, schemas

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
            "horario_previsto": pront.horario_previsto,
            "horario_realizado": pront.horario_realizado,
            "status": pront.status,
            "observacoes": pront.observacoes
        })
    
    return resultado


@router.post("/gerar-do-dia")
def gerar_prontuarios_do_dia(db: Session = Depends(get_db)):
    hoje = date.today()
    
    existentes = db.query(models.Prontuario).filter(
        models.Prontuario.data == hoje
    ).count()
    
    if existentes > 0:
        return {"message": "Prontuários de hoje já foram gerados", "quantidade": existentes}
    
    idosos = db.query(models.Idoso).all()
    contador = 0
    
    for idoso in idosos:
        for remedio in idoso.remedios:
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
    return {"message": "Prontuários gerados com sucesso", "quantidade": contador}


@router.post("/", response_model=schemas.Prontuario)
def criar_prontuario(prontuario: schemas.ProntuarioCreate, db: Session = Depends(get_db)):
    db_prontuario = models.Prontuario(**prontuario.dict())
    db.add(db_prontuario)
    db.commit()
    db.refresh(db_prontuario)
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
    return db_prontuario


@router.delete("/{prontuario_id}")
def deletar_prontuario(prontuario_id: int, db: Session = Depends(get_db)):
    db_prontuario = db.query(models.Prontuario).filter(
        models.Prontuario.id == prontuario_id
    ).first()
    
    if not db_prontuario:
        raise HTTPException(status_code=404, detail="Prontuário não encontrado")
    
    db.delete(db_prontuario)
    db.commit()
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
