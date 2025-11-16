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


# ---------- Settings & Audit Logs ----------
def get_settings(db: Session):
    return db.query(models.Setting).all()


def get_setting(db: Session, key: str):
    return db.query(models.Setting).filter(models.Setting.key == key).first()


def create_or_update_setting(db: Session, key: str, value: str, description: str | None = None):
    setting = get_setting(db, key)
    if setting:
        setting.value = value
        if description is not None:
            setting.description = description
    else:
        setting = models.Setting(key=key, value=value, description=description)
        db.add(setting)
    db.commit()
    db.refresh(setting)
    return setting


def create_audit_log(db: Session, timestamp, action: str, user: str | None = None, target_table: str | None = None, target_id: int | None = None, description: str | None = None):
    log = models.AuditLog(
        timestamp=timestamp,
        user=user,
        action=action,
        target_table=target_table,
        target_id=target_id,
        description=description
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def get_audit_logs(db: Session, limit: int = 200):
    return db.query(models.AuditLog).order_by(models.AuditLog.timestamp.desc()).limit(limit).all()


def create_profile(db: Session, profile: schemas.ProfileCreate):
    db_profile = models.Profile(name=profile.name, description=profile.description)
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile


def list_profiles(db: Session):
    return db.query(models.Profile).all()


def get_profile(db: Session, profile_id: int):
    return db.query(models.Profile).filter(models.Profile.id == profile_id).first()


def create_user(db: Session, user: schemas.UserCreate):
    # NOTE: password stored as plaintext for now; consider hashing
    db_user = models.User(username=user.username, password=user.password, full_name=user.full_name, profile_id=user.profile_id)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def list_users(db: Session):
    return db.query(models.User).all()


def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()


def delete_user(db: Session, user_id: int):
    u = get_user(db, user_id)
    if u:
        db.delete(u)
        db.commit()
        return True
    return False
