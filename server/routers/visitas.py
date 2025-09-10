from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from server import crud 
from server.data import schemas, database

router = APIRouter(prefix="/visitas", tags=["Visitas"])


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/{idoso_id}", response_model=schemas.Visita)
def registrar_visita(idoso_id: int, visita: schemas.VisitaCreate, db: Session = Depends(get_db)):
    return crud.create_visita(db, visita, idoso_id)
