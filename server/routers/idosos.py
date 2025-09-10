from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from server import crud
from ..data import schemas, database

router = APIRouter(prefix="/idosos", tags=["Idosos"])

@router.post("/", response_model=schemas.Idoso)
def criar_idoso(idoso: schemas.IdosoCreate, db: Session = Depends(database.SessionLocal)):
    return crud.create_idoso(db, idoso)

@router.get("/", response_model=list[schemas.Idoso])
def listar_idosos(db: Session = Depends(database.SessionLocal)):
    return crud.get_idosos(db)
