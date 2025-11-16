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
        data_formatada = db_visita.data.strftime("%d/%m/%Y")
        
        crud.create_audit_log(
            db,
            datetime.now(),
            action="Registro de Visita",
            target_table="visitas",
            target_id=db_visita.id,
            description=f"Visita registrada para {idoso_nome} em {data_formatada} - Visitante: {db_visita.visitante}"
        )
    except Exception:
        pass
    return db_visita
