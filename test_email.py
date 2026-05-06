import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv

# Cargar configuración del .env
load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "465"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")
EMAIL_FROM = os.getenv("EMAIL_FROM")

print("--------------------------------------------------")
print("🔍 INICIANDO PRUEBA DE ENVÍO DE CORREO")
print("--------------------------------------------------")
print(f"Host: {SMTP_HOST}")
print(f"Usuario: {SMTP_USER}")
print("Intentando conectar al servidor SMTP...")

try:
    # Preparar el correo
    msg = EmailMessage()
    msg['Subject'] = "Prueba de AutoProof Check IA"
    msg['From'] = EMAIL_FROM
    msg['To'] = SMTP_USER # Se enviará a ti mismo
    msg.set_content("Hola,\n\nSi estás leyendo este mensaje, ¡significa que tu configuración de correos funciona perfectamente!\n\nSaludos desde el script de prueba.")

    # Conectar y enviar
    server = smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=10)
    server.ehlo()
    server.login(SMTP_USER, SMTP_PASS)
    server.send_message(msg)
    server.quit()
    
    print("\n✅ ¡ÉXITO! El correo de prueba fue enviado.")
    print("Por favor revisa tu bandeja de entrada (o carpeta de spam).")
except smtplib.SMTPAuthenticationError:
    print("\n⚠️ ERROR DE AUTENTICACIÓN: La contraseña de aplicación es incorrecta o Google está bloqueando el acceso.")
    print("Por favor verifica que no haya espacios en la contraseña y que tu cuenta tenga la verificación de 2 pasos activa.")
except Exception as e:
    print(f"\n⚠️ ERROR DESCONOCIDO: No se pudo enviar el correo. Detalle:\n{e}")
print("--------------------------------------------------")
