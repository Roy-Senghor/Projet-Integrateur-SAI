from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.email_service import send_test_email

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)

class EmailRequest(BaseModel):
    recipient: str

@router.post("/test-email")
def test_email(req: EmailRequest):
    if not req.recipient:
        raise HTTPException(status_code=400, detail="L'adresse email du destinataire est requise")
        
    success = send_test_email(req.recipient)
    if not success:
        raise HTTPException(status_code=500, detail="Échec de l'envoi de l'email. Vérifiez vos identifiants Gmail dans le fichier .env.")
        
    return {"message": "Email de test envoyé avec succès"}
