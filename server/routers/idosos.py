from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from server import crud
from ..data import schemas, database, models
from datetime import datetime

router = APIRouter(prefix="/idosos", tags=["Idosos"])

@router.post("/", response_model=schemas.Idoso)
def criar_idoso(idoso: schemas.IdosoCreate, db: Session = Depends(database.get_db)):
    db_idoso = crud.create_idoso(db, idoso)
    try:
        crud.create_audit_log(
            db, 
            datetime.now(), 
            action="Criação de Idoso", 
            target_table="idosos", 
            target_id=db_idoso.id, 
            description=f"Novo idoso cadastrado: {db_idoso.nome} (CPF: {db_idoso.cpf})"
        )
    except Exception:
        pass
    return db_idoso

@router.get("/", response_model=list[schemas.Idoso])
def listar_idosos(db: Session = Depends(database.get_db)):
    return crud.get_idosos(db)


@router.get("/{idoso_id}", response_model=schemas.Idoso)
def buscar_idoso(idoso_id: int, db: Session = Depends(database.get_db)):
    idoso = db.query(models.Idoso).filter(models.Idoso.id == idoso_id).first()
    if not idoso:
        raise HTTPException(status_code=404, detail="Idoso não encontrado")
    return idoso


@router.put("/{idoso_id}", response_model=schemas.Idoso)
def atualizar_idoso(
    idoso_id: int,
    idoso_update: schemas.IdosoUpdate,
    db: Session = Depends(database.get_db)
):
    db_idoso = db.query(models.Idoso).filter(models.Idoso.id == idoso_id).first()
    if not db_idoso:
        raise HTTPException(status_code=404, detail="Idoso não encontrado")
    
    # Atualizar apenas os campos fornecidos
    update_data = idoso_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_idoso, field, value)
    
    db.commit()
    db.refresh(db_idoso)
    try:
        # Criar descrição detalhada das mudanças
        changes = []
        field_names = {
            'nome': 'Nome',
            'cpf': 'CPF',
            'data_nascimento': 'Data de Nascimento',
            'telefone': 'Telefone',
            'endereco': 'Endereço',
            'observacoes': 'Observações'
        }
        for field in update_data.keys():
            field_label = field_names.get(field, field)
            changes.append(field_label)
        
        description = f"Idoso '{db_idoso.nome}' atualizado. Campos alterados: {', '.join(changes)}"
        crud.create_audit_log(
            db, 
            datetime.now(), 
            action="Atualização de Idoso", 
            target_table="idosos", 
            target_id=db_idoso.id, 
            description=description
        )
    except Exception:
        pass
    return db_idoso


@router.delete("/{idoso_id}")
def deletar_idoso(idoso_id: int, db: Session = Depends(database.get_db)):
    # Buscar nome do idoso antes de deletar
    db_idoso = db.query(models.Idoso).filter(models.Idoso.id == idoso_id).first()
    idoso_nome = db_idoso.nome if db_idoso else "Desconhecido"
    
    success = crud.delete_idoso(db, idoso_id)
    if not success:
        raise HTTPException(status_code=404, detail="Idoso não encontrado")
    try:
        crud.create_audit_log(
            db, 
            datetime.now(), 
            action="Exclusão de Idoso", 
            target_table="idosos", 
            target_id=idoso_id, 
            description=f"Idoso removido do sistema: {idoso_nome} (ID: {idoso_id})"
        )
    except Exception:
        pass
    return {"message": "Idoso deletado com sucesso"}
