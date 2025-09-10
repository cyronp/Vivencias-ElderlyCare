from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from server import crud
from server.data import schemas, database
router = APIRouter(prefix="/remedios", tags=["Remédios"])


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/{idoso_id}", response_model=schemas.Remedio)
def adicionar_remedio(idoso_id: int, remedio: schemas.RemedioCreate, db: Session = Depends(get_db)):
    return crud.create_remedio(db, remedio, idoso_id)
