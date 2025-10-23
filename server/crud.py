from sqlalchemy.orm import Session
from server.data import models, schemas


def get_idosos(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Idoso).offset(skip).limit(limit).all()


def get_idoso(db: Session, idoso_id: int):
    return db.query(models.Idoso).filter(models.Idoso.id == idoso_id).first()


def create_idoso(db: Session, idoso: schemas.IdosoCreate):
    db_idoso = models.Idoso(
        nome=idoso.nome,
        idade=idoso.idade,
        data_nascimento=idoso.data_nascimento,
    )
    db.add(db_idoso)
    db.commit()
    db.refresh(db_idoso)

    for remedio in idoso.remedios:
        db_remedio = models.Remedio(**remedio.dict(), idoso_id=db_idoso.id)
        db.add(db_remedio)

    for filho in idoso.filhos:
        db_filho = models.Filho(**filho.dict(), idoso_id=db_idoso.id)
        db.add(db_filho)

    db.commit()
    db.refresh(db_idoso)
    return db_idoso


def delete_idoso(db: Session, idoso_id: int):
    db_idoso = get_idoso(db, idoso_id)
    if db_idoso:
        db.delete(db_idoso)
        db.commit()
        return True
    return False


def create_remedio(db: Session, remedio: schemas.RemedioCreate, idoso_id: int):
    db_remedio = models.Remedio(**remedio.dict(), idoso_id=idoso_id)
    db.add(db_remedio)
    db.commit()
    db.refresh(db_remedio)
    return db_remedio


def create_filho(db: Session, filho: schemas.FilhoCreate, idoso_id: int):
    db_filho = models.Filho(**filho.dict(), idoso_id=idoso_id)
    db.add(db_filho)
    db.commit()
    db.refresh(db_filho)
    return db_filho


def create_visita(db: Session, visita: schemas.VisitaCreate, idoso_id: int):
    db_visita = models.Visita(**visita.dict(), idoso_id=idoso_id)
    db.add(db_visita)
    db.commit()
    db.refresh(db_visita)
    return db_visita
