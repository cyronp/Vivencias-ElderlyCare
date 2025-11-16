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


class Setting(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, nullable=False)
    value = Column(String, nullable=True)
    description = Column(String, nullable=True)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, nullable=False)
    user = Column(String, nullable=True)
    action = Column(String, nullable=False)
    target_table = Column(String, nullable=True)
    target_id = Column(Integer, nullable=True)
    description = Column(String, nullable=True)


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    profile_id = Column(Integer, ForeignKey("profiles.id"))

    profile = relationship("Profile")
