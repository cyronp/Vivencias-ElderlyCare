from fastapi import FastAPI
from server.routers import idosos, remedios, filhos, visitas
from server.data.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sistema de Gerenciamento da Casa de Idosos")

app.include_router(idosos.router)
app.include_router(remedios.router)
app.include_router(filhos.router)
app.include_router(visitas.router)

