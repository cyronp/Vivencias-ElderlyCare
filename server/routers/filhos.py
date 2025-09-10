from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from server import crud
from server.data import schemas, database

router = APIRouter(prefix="/filhos", tags=["Filhos"])


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/{idoso_id}", response_model=schemas.Filho)
def adicionar_filho(idoso_id: int, filho: schemas.FilhoCreate, db: Session = Depends(get_db)):
    return crud.create_filho(db, filho, idoso_id)
