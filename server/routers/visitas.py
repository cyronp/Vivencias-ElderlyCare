from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from server import crud 
from server.data import schemas, database, models
from datetime import datetime

router = APIRouter(prefix="/visitas", tags=["Visitas"])


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/{idoso_id}", response_model=schemas.Visita)
def registrar_visita(idoso_id: int, visita: schemas.VisitaCreate, db: Session = Depends(get_db)):
    db_visita = crud.create_visita(db, visita, idoso_id)
    try:
        # Buscar nome do idoso
        idoso = db.query(models.Idoso).filter(models.Idoso.id == idoso_id).first()
        idoso_nome = idoso.nome if idoso else "Desconhecido"
        
        # Formatar data
        data_formatada = db_visita.data_visita.strftime("%d/%m/%Y")
        
        crud.create_audit_log(
            db,
            datetime.now(),
            action="Registro de Visita",
            target_table="visitas",
            target_id=db_visita.id,
            description=f"Visita registrada para {idoso_nome} em {data_formatada} - Visitante: {db_visita.responsavel or 'Não informado'}"
        )
    except Exception:
        pass
    return db_visita


@router.delete("/{visita_id}")
def deletar_visita(visita_id: int, db: Session = Depends(get_db)):
    # Buscar informações da visita antes de deletar
    visita = db.query(models.Visita).filter(models.Visita.id == visita_id).first()
    
    if not visita:
        raise HTTPException(status_code=404, detail="Visita não encontrada")
    
    # Buscar nome do idoso
    idoso = db.query(models.Idoso).filter(models.Idoso.id == visita.idoso_id).first()
    idoso_nome = idoso.nome if idoso else "Desconhecido"
    data_formatada = visita.data_visita.strftime("%d/%m/%Y")
    
    # Deletar visita
    db.delete(visita)
    db.commit()
    
    try:
        crud.create_audit_log(
            db,
            datetime.now(),
            action="Exclusão de Visita",
            target_table="visitas",
            target_id=visita_id,
            description=f"Visita removida - Idoso: {idoso_nome} - Data: {data_formatada}"
        )
    except Exception:
        pass
    
    return {"message": "Visita deletada com sucesso"}
