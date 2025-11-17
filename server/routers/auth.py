from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..data import database, models

router = APIRouter(prefix="/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    message: str
    success: bool
    username: str

@router.post("/login", response_model=LoginResponse)
def login(credentials: LoginRequest, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.username == credentials.username).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="Usuário ou senha incorretos")
    
    if user.password != credentials.password:
        raise HTTPException(status_code=401, detail="Usuário ou senha incorretos")
    
    return LoginResponse(
        message="Login realizado com sucesso!",
        success=True,
        username=user.username
    )
