from sqlalchemy import Column, Integer, String, Date, Time, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class Idoso(Base):
    __tablename__ = "idosos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    idade = Column(Integer)
    data_nascimento = Column(Date)

    remedios = relationship("Remedio", back_populates="idoso", cascade="all, delete")
    filhos = relationship("Filho", back_populates="idoso", cascade="all, delete")
    visitas = relationship("Visita", back_populates="idoso", cascade="all, delete")


class Remedio(Base):
    __tablename__ = "remedios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    dosagem = Column(String)
    horario = Column(Time)

    idoso_id = Column(Integer, ForeignKey("idosos.id"))
    idoso = relationship("Idoso", back_populates="remedios")


class Filho(Base):
    __tablename__ = "filhos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    telefone = Column(String)

    idoso_id = Column(Integer, ForeignKey("idosos.id"))
    idoso = relationship("Idoso", back_populates="filhos")


class Visita(Base):
    __tablename__ = "visitas"

    id = Column(Integer, primary_key=True, index=True)
    data_visita = Column(Date, nullable=False)
    responsavel = Column(String)

    idoso_id = Column(Integer, ForeignKey("idosos.id"))
    idoso = relationship("Idoso", back_populates="visitas")
