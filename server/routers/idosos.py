from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from server import crud
from ..data import schemas, database

router = APIRouter(prefix="/idosos", tags=["Idosos"])

@router.post("/", response_model=schemas.Idoso)
def criar_idoso(idoso: schemas.IdosoCreate, db: Session = Depends(database.get_db)):
    return crud.create_idoso(db, idoso)

@router.get("/", response_model=list[schemas.Idoso])
def listar_idosos(db: Session = Depends(database.get_db)):
    return crud.get_idosos(db)

@router.delete("/{idoso_id}")
def deletar_idoso(idoso_id: int, db: Session = Depends(database.get_db)):
    success = crud.delete_idoso(db, idoso_id)
    if not success:
        raise HTTPException(status_code=404, detail="Idoso não encontrado")
    return {"message": "Idoso deletado com sucesso"}
