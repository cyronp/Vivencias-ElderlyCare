from pydantic import BaseModel
from datetime import date, time
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
        orm_mode = True


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
        orm_mode = True


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
        orm_mode = True


# ---------- Idoso ----------
class IdosoBase(BaseModel):
    nome: str
    idade: Optional[int] = None
    data_nascimento: Optional[date] = None


class IdosoCreate(IdosoBase):
    remedios: List[RemedioCreate] = []
    filhos: List[FilhoCreate] = []


class Idoso(IdosoBase):
    id: int
    remedios: List[Remedio] = []
    filhos: List[Filho] = []
    visitas: List[Visita] = []

    class Config:
        orm_mode = True
