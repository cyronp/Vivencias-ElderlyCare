from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from server import crud
from ..data import schemas, database, models

router = APIRouter(prefix="/idosos", tags=["Idosos"])

@router.post("/", response_model=schemas.Idoso)
def criar_idoso(idoso: schemas.IdosoCreate, db: Session = Depends(database.get_db)):
    return crud.create_idoso(db, idoso)

@router.get("/", response_model=list[schemas.Idoso])
def listar_idosos(db: Session = Depends(database.get_db)):
    return crud.get_idosos(db)


@router.get("/{idoso_id}", response_model=schemas.Idoso)
def buscar_idoso(idoso_id: int, db: Session = Depends(database.get_db)):
    idoso = db.query(models.Idoso).filter(models.Idoso.id == idoso_id).first()
    if not idoso:
        raise HTTPException(status_code=404, detail="Idoso não encontrado")
    return idoso


@router.put("/{idoso_id}", response_model=schemas.Idoso)
def atualizar_idoso(
    idoso_id: int,
    idoso_update: schemas.IdosoUpdate,
    db: Session = Depends(database.get_db)
):
    db_idoso = db.query(models.Idoso).filter(models.Idoso.id == idoso_id).first()
    if not db_idoso:
        raise HTTPException(status_code=404, detail="Idoso não encontrado")
    
    # Atualizar apenas os campos fornecidos
    update_data = idoso_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_idoso, field, value)
    
    db.commit()
    db.refresh(db_idoso)
    return db_idoso


@router.delete("/{idoso_id}")
def deletar_idoso(idoso_id: int, db: Session = Depends(database.get_db)):
    success = crud.delete_idoso(db, idoso_id)
    if not success:
        raise HTTPException(status_code=404, detail="Idoso não encontrado")
    return {"message": "Idoso deletado com sucesso"}
