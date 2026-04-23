from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.models import User, Capteur, Mesure, Actionneur, Action, Seuil, Alerte, Audit  
from app.routes import auth, capteurs, mesures, actionneurs, seuils, alertes, websocket
 
Base.metadata.create_all(bind=engine)
 
app = FastAPI(
    title=settings.APP_NAME,
    description="API REST — Système de surveillance agricole IoT",
    version="2.0.0",
)
 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
 
app.include_router(auth.router)
app.include_router(capteurs.router)
app.include_router(mesures.router)
app.include_router(actionneurs.router)
app.include_router(seuils.router)
app.include_router(alertes.router)
app.include_router(websocket.router)
 
 
@app.get("/", tags=["Santé"])
def health_check():
    return {"status": "ok", "app": settings.APP_NAME, "version": "2.0.0"}
