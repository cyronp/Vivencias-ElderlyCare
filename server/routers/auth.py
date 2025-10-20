from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    message: str
    success: bool
    username: str

@router.post("/login", response_model=LoginResponse)
def login(credentials: LoginRequest):
    if credentials.username == "admin" and credentials.password == "admin":
        return LoginResponse(
            message="Login realizado com sucesso!",
            success=True,
            username=credentials.username
        )
    else:
        raise HTTPException(status_code=401, detail="Usuário ou senha incorretos")
