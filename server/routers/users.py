from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from ..data import database, schemas, models
from server import crud

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/profiles", response_model=List[schemas.Profile])
def list_profiles(db: Session = Depends(database.get_db)):
    return crud.list_profiles(db)

@router.post("/profiles", response_model=schemas.Profile)
def create_profile(profile: schemas.ProfileCreate, db: Session = Depends(database.get_db)):
    p = crud.create_profile(db, profile)
    try:
        crud.create_audit_log(
            db, 
            datetime.now(), 
            action="Criação de Perfil", 
            target_table="profiles", 
            target_id=p.id, 
            description=f"Novo perfil de usuário criado: '{p.name}'"
        )
    except Exception:
        pass
    return p

@router.get("/", response_model=List[schemas.User])
def list_users(db: Session = Depends(database.get_db)):
    return crud.list_users(db)

@router.post("/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    existing = db.query(models.User).filter(models.User.username == user.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Usuário já existe")
    u = crud.create_user(db, user)
    try:
        crud.create_audit_log(
            db, 
            datetime.now(), 
            action="Cadastro de Usuário", 
            target_table="users", 
            target_id=u.id, 
            description=f"Novo usuário cadastrado: '{u.username}'"
        )
    except Exception:
        pass
    return u

@router.get("/{user_id}", response_model=schemas.User)
def get_user(user_id: int, db: Session = Depends(database.get_db)):
    u = crud.get_user(db, user_id)
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    return u

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(database.get_db)):
    # Buscar informações do usuário antes de deletar
    user = db.query(models.User).filter(models.User.id == user_id).first()
    username = user.username if user else "Desconhecido"
    
    success = crud.delete_user(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    try:
        crud.create_audit_log(
            db, 
            datetime.now(), 
            action="Exclusão de Usuário", 
            target_table="users", 
            target_id=user_id, 
            description=f"Usuário removido do sistema: '{username}' (ID: {user_id})"
        )
    except Exception:
        pass
    return {"message": "User deleted"}
