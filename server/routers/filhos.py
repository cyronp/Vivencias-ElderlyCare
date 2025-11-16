from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from server import crud
from server.data import schemas, database, models
from datetime import datetime

router = APIRouter(prefix="/filhos", tags=["Filhos"])


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/{idoso_id}", response_model=schemas.Filho)
def adicionar_filho(idoso_id: int, filho: schemas.FilhoCreate, db: Session = Depends(get_db)):
    db_filho = crud.create_filho(db, filho, idoso_id)
    try:
        # Buscar nome do idoso
        idoso = db.query(models.Idoso).filter(models.Idoso.id == idoso_id).first()
        idoso_nome = idoso.nome if idoso else "Desconhecido"
        
        crud.create_audit_log(
            db,
            datetime.now(),
            action="Cadastro de Responsável",
            target_table="filhos",
            target_id=db_filho.id,
            description=f"Responsável '{db_filho.nome}' vinculado ao idoso '{idoso_nome}' (Telefone: {db_filho.telefone})"
        )
    except Exception:
        pass
    return db_filho
