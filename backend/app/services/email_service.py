"""
Service d'envoi d'emails via Gmail SMTP.
Utilise les variables d'environnement pour la configuration.
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from app.core.config import settings


def send_email(subject: str, body_html: str, to_email: str) -> bool:
    """
    Envoie un email via Gmail SMTP.
    Retourne True si succès, False sinon.
    """
    if not settings.GMAIL_ADDRESS or not settings.GMAIL_APP_PASSWORD:
        print("Email non configuré (GMAIL_ADDRESS ou GMAIL_APP_PASSWORD manquant)")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"]    = f"AgroSmart <{settings.GMAIL_ADDRESS}>"
        msg["To"]      = to_email

        msg.attach(MIMEText(body_html, "html", "utf-8"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(settings.GMAIL_ADDRESS, settings.GMAIL_APP_PASSWORD)
            server.sendmail(settings.GMAIL_ADDRESS, to_email, msg.as_string())

        print(f"Email envoyé à {to_email} : {subject}")
        return True

    except Exception as e:
        print(f"Erreur envoi email : {e}")
        return False


def send_alert_email(
    type_mesure: str,
    valeur: float,
    seuil: float,
    message: str,
    to_email: str,
) -> bool:
    """Email d'alerte formaté pour un dépassement de seuil."""
    now = datetime.now().strftime("%d/%m/%Y à %H:%M")

    html = f"""
    <!DOCTYPE html>
    <html lang="fr">
    <body style="margin:0;padding:0;background:#f0f4f1;font-family:'Segoe UI',Arial,sans-serif;">
      <div style="max-width:560px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <div style="background:linear-gradient(135deg,#0f2e17,#1f5e2d);padding:28px 32px;text-align:center;">
          <div style="display:inline-flex;align-items:center;gap:10px;">
            <span style="font-size:1.8rem;">🌱</span>
            <span style="color:white;font-size:1.4rem;font-weight:800;letter-spacing:-0.5px;">AgroSmart</span>
          </div>
          <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:0.85rem;">Système de surveillance agricole</p>
        </div>

        <!-- Alert banner -->
        <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:20px 32px;display:flex;align-items:center;gap:12px;">
          <span style="font-size:1.6rem;">🚨</span>
          <div>
            <div style="font-weight:700;font-size:1rem;color:#991b1b;">Alerte détectée</div>
            <div style="font-size:0.82rem;color:#b91c1c;margin-top:2px;">{now}</div>
          </div>
        </div>

        <!-- Content -->
        <div style="padding:28px 32px;">
          <p style="font-size:0.95rem;color:#374151;margin:0 0 20px;">{message}</p>

          <table style="width:100%;border-collapse:collapse;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr style="background:#f9fafb;">
              <td style="padding:12px 16px;font-weight:600;font-size:0.82rem;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;width:40%;">Capteur</td>
              <td style="padding:12px 16px;font-weight:700;color:#111827;">{type_mesure.replace('_',' ').title()}</td>
            </tr>
            <tr>
              <td style="padding:12px 16px;font-weight:600;font-size:0.82rem;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Valeur mesurée</td>
              <td style="padding:12px 16px;font-weight:700;color:#ef4444;font-family:monospace;font-size:1.1rem;">{valeur}</td>
            </tr>
            <tr style="background:#f9fafb;">
              <td style="padding:12px 16px;font-weight:600;font-size:0.82rem;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Seuil configuré</td>
              <td style="padding:12px 16px;font-weight:700;color:#111827;font-family:monospace;">{seuil}</td>
            </tr>
          </table>

          <div style="margin-top:24px;padding:16px;background:#f0fdf4;border-radius:12px;border:1px solid #a7f3d0;">
            <p style="margin:0;font-size:0.82rem;color:#065f46;">
              💡 <strong>Action requise :</strong> Connectez-vous à AgroSmart pour consulter et résoudre cette alerte.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="padding:16px 32px;border-top:1px solid #f3f4f6;text-align:center;">
          <p style="margin:0;font-size:0.72rem;color:#9ca3af;">
            AgroSmart — Système de surveillance agricole automatisé<br/>
            Cet email a été envoyé automatiquement, ne pas répondre.
          </p>
        </div>
      </div>
    </body>
    </html>
    """

    return send_email(
        subject=f"🚨 [AgroSmart] Alerte {type_mesure} : {valeur}",
        body_html=html,
        to_email=to_email,
    )


def send_test_email(to_email: str) -> bool:
    """Email de test pour vérifier la configuration."""
    html = f"""
    <!DOCTYPE html>
    <html lang="fr">
    <body style="margin:0;padding:0;background:#f0f4f1;font-family:'Segoe UI',Arial,sans-serif;">
      <div style="max-width:560px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#0f2e17,#1f5e2d);padding:28px 32px;text-align:center;">
          <span style="color:white;font-size:1.4rem;font-weight:800;">🌱 AgroSmart</span>
        </div>
        <div style="padding:32px;">
          <div style="text-align:center;margin-bottom:24px;">
            <span style="font-size:3rem;">✅</span>
            <h2 style="margin:12px 0 4px;color:#0f2e17;">Email configuré avec succès !</h2>
            <p style="color:#6b7280;font-size:0.875rem;">Votre configuration Gmail fonctionne correctement.</p>
          </div>
          <div style="background:#f0fdf4;border-radius:12px;padding:16px;border:1px solid #a7f3d0;text-align:center;">
            <p style="margin:0;font-size:0.85rem;color:#065f46;">
              Les alertes seront envoyées automatiquement à <strong>{to_email}</strong>
              dès qu'un seuil sera dépassé.
            </p>
          </div>
        </div>
        <div style="padding:16px 32px;border-top:1px solid #f3f4f6;text-align:center;">
          <p style="margin:0;font-size:0.72rem;color:#9ca3af;">AgroSmart — Email de test envoyé le {datetime.now().strftime('%d/%m/%Y à %H:%M')}</p>
        </div>
      </div>
    </body>
    </html>
    """
    return send_email("✅ [AgroSmart] Test de configuration email", html, to_email)
