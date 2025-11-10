from sqlalchemy import Column, Integer, String, Date, Time, DateTime, ForeignKey
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
    prontuarios = relationship("Prontuario", back_populates="idoso", cascade="all, delete")


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


class Prontuario(Base):
    __tablename__ = "prontuarios"

    id = Column(Integer, primary_key=True, index=True)
    idoso_id = Column(Integer, ForeignKey("idosos.id"), nullable=False)
    remedio_id = Column(Integer, ForeignKey("remedios.id"), nullable=False)
    data = Column(Date, nullable=False)
    horario_previsto = Column(Time, nullable=False)
    horario_realizado = Column(DateTime)
    status = Column(String, default="pendente")
    observacoes = Column(String)

    idoso = relationship("Idoso", back_populates="prontuarios")
    remedio = relationship("Remedio")
