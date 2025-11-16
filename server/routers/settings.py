from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from ..data import database, schemas
from server import crud

router = APIRouter(prefix="/settings", tags=["settings"])

@router.get("/logs", response_model=list[schemas.AuditLog])
def listar_logs(limit: int = 200, db: Session = Depends(database.get_db)):
    return crud.get_audit_logs(db, limit=limit)


@router.get("/", response_model=list[schemas.Setting])
def listar_settings(db: Session = Depends(database.get_db)):
    return crud.get_settings(db)


@router.get("/{key}", response_model=schemas.Setting)
def get_setting(key: str, db: Session = Depends(database.get_db)):
    s = crud.get_setting(db, key)
    if not s:
        raise HTTPException(status_code=404, detail="Setting not found")
    return s


@router.put("/{key}", response_model=schemas.Setting)
def update_setting(key: str, payload: schemas.SettingBase, db: Session = Depends(database.get_db)):
    s = crud.create_or_update_setting(db, key, payload.value or "", payload.description)
    # Log the change
    try:
        crud.create_audit_log(
            db, 
            datetime.now(), 
            action="Alteração de Configuração", 
            target_table="settings",
            description=f"Configuração '{key}' alterada para: {payload.value}"
        )
    except Exception:
        pass
    return s
