from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from server import crud
from server.data import schemas, database, models
from datetime import datetime

router = APIRouter(prefix="/remedios", tags=["Remédios"])


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/{idoso_id}", response_model=schemas.Remedio)
def adicionar_remedio(idoso_id: int, remedio: schemas.RemedioCreate, db: Session = Depends(get_db)):
    db_remedio = crud.create_remedio(db, remedio, idoso_id)
    try:
        # Buscar nome do idoso
        idoso = db.query(models.Idoso).filter(models.Idoso.id == idoso_id).first()
        idoso_nome = idoso.nome if idoso else "Desconhecido"
        
        crud.create_audit_log(
            db,
            datetime.now(),
            action="Cadastro de Remédio",
            target_table="remedios",
            target_id=db_remedio.id,
            description=f"Remédio '{db_remedio.nome}' adicionado para {idoso_nome} - Dosagem: {db_remedio.dosagem}, Frequência: {db_remedio.frequencia}"
        )
    except Exception:
        pass
    return db_remedio
