from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from server.routers import idosos, remedios, filhos, visitas, auth, prontuarios
from server.data.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sistema de Gerenciamento da Casa de Idosos")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(auth.router)
app.include_router(idosos.router)
app.include_router(remedios.router)
app.include_router(filhos.router)
app.include_router(visitas.router)
app.include_router(prontuarios.router)

@app.get("/")
async def root():
    return FileResponse("static/index.html")

