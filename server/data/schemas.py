from pydantic import BaseModel
from datetime import date, time, datetime
from typing import List, Optional


# ---------- Remédio ----------
class RemedioBase(BaseModel):
    nome: str
    dosagem: Optional[str] = None
    horario: time


class RemedioCreate(RemedioBase):
    pass


class Remedio(RemedioBase):
    id: int
    idoso_id: int

    class Config:
        from_attributes = True


# ---------- Filho ----------
class FilhoBase(BaseModel):
    nome: str
    telefone: Optional[str] = None


class FilhoCreate(FilhoBase):
    pass


class Filho(FilhoBase):
    id: int
    idoso_id: int

    class Config:
        from_attributes = True


# ---------- Visita ----------
class VisitaBase(BaseModel):
    data_visita: date
    responsavel: Optional[str] = None


class VisitaCreate(VisitaBase):
    pass


class Visita(VisitaBase):
    id: int
    idoso_id: int

    class Config:
        from_attributes = True


# ---------- Idoso ----------
class IdosoBase(BaseModel):
    nome: str
    idade: Optional[int] = None
    data_nascimento: Optional[date] = None


class IdosoCreate(IdosoBase):
    remedios: List[RemedioCreate] = []
    filhos: List[FilhoCreate] = []


class IdosoUpdate(BaseModel):
    nome: Optional[str] = None
    idade: Optional[int] = None
    data_nascimento: Optional[date] = None


class Idoso(IdosoBase):
    id: int
    remedios: List[Remedio] = []
    filhos: List[Filho] = []
    visitas: List[Visita] = []

    class Config:
        from_attributes = True


# ---------- Prontuário ----------
class ProntuarioBase(BaseModel):
    idoso_id: int
    remedio_id: int
    data: date
    horario_previsto: time
    status: str = "pendente" 
    observacoes: Optional[str] = None


class ProntuarioCreate(BaseModel):
    idoso_id: int
    remedio_id: int
    data: date
    horario_previsto: time


class ProntuarioUpdate(BaseModel):
    status: str
    horario_realizado: Optional[datetime] = None
    observacoes: Optional[str] = None


class Prontuario(ProntuarioBase):
    id: int
    horario_realizado: Optional[datetime] = None

    class Config:
        from_attributes = True


# ---------- Settings ----------
class SettingBase(BaseModel):
    key: str
    value: Optional[str] = None
    description: Optional[str] = None


class SettingCreate(SettingBase):
    pass


class Setting(SettingBase):
    id: int

    class Config:
        from_attributes = True


# ---------- Audit Log ----------
class AuditLogBase(BaseModel):
    timestamp: datetime
    user: Optional[str] = None
    action: str
    target_table: Optional[str] = None
    target_id: Optional[int] = None
    description: Optional[str] = None


class AuditLog(AuditLogBase):
    id: int

    class Config:
        from_attributes = True


# ---------- Profile / User ----------
class ProfileBase(BaseModel):
    name: str
    description: Optional[str] = None


class ProfileCreate(ProfileBase):
    pass


class Profile(ProfileBase):
    id: int

    class Config:
        from_attributes = True


class UserBase(BaseModel):
    username: str
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str
    profile_id: Optional[int] = None


class User(UserBase):
    id: int
    profile: Optional[Profile] = None

    class Config:
        from_attributes = True
