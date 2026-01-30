import smtplib
import os
import re
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Robust .env loading 
def load_app_env():
    # 1. Try default
    load_dotenv()
    # 2. Try explicit path relative to this file
    base_dir = os.path.dirname(os.path.abspath(__file__))
    env_path = os.path.join(base_dir, ".env")
    if os.path.exists(env_path):
        load_dotenv(env_path, override=True)
    # 3. Try parent dir (in case we are running from be/ and .env is in blossom_backend/)
    load_dotenv(os.path.join(base_dir, "..", ".env"), override=True)

load_app_env()

def mask_credential(val):
    if not val: return "NOT SET"
    if len(val) < 4: return "****"
    return f"{val[:2]}****{val[-2:]}"

def send_email(to_email, subject, body):
    # Ensure any quotes or whitespaces are removed
    def clean_env(key):
        val = os.getenv(key, "")
        if not val: return ""
        return val.strip().strip('"').strip("'")

    smtp_server = clean_env("SMTP_SERVER")
    smtp_port = clean_env("SMTP_PORT")
    email_address = clean_env("EMAIL_ADDRESS")
    email_password = clean_env("EMAIL_PASSWORD")

    print(f"DEBUG: Email Attempt for {to_email}")
    print(f"DEBUG: Config - Server: {smtp_server}, Port: {smtp_port}")
    print(f"DEBUG: Config - From: {mask_credential(email_address)}")
    print(f"DEBUG: Config - Pass: {mask_credential(email_password)}")

    if not all([smtp_server, smtp_port, email_address, email_password]):
        print(f"❌ CRITICAL: Missing email configuration in environment variables.")
        return False

    msg = MIMEMultipart()
    msg["From"] = email_address
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        port = int(smtp_port)
        
        print(f"DEBUG: Step 1 - Connecting to {smtp_server}:{port}...")
        if port == 465:
            server = smtplib.SMTP_SSL(smtp_server, port, timeout=15)
        else:
            server = smtplib.SMTP(smtp_server, port, timeout=15)
            print("DEBUG: Step 2 - Sending STARTTLS...")
            server.starttls()
            server.ehlo() # Re-identify after TLS
            
        print(f"DEBUG: Step 3 - Attempting Login for {mask_credential(email_address)}...")
        server.login(email_address, email_password)
        
        print(f"DEBUG: Step 4 - Sending Message...")
        server.send_message(msg)
        server.quit()
        print(f"✅ SUCCESS: Email sent to {to_email}")
        return True
    except Exception as e:
        print(f"❌ ERROR: Failed to send email to {to_email}")
        print(f"❌ ERROR DETAIL: {str(e)}")
        if "535" in str(e):
            print("💡 TIP: Gmail rejected your credentials. PLEASE RE-CHECK YOUR APP PASSWORD. Do not use your regular account password.")
        elif "connect" in str(e).lower():
            print("💡 TIP: Connection failed. Check if your SMTP_SERVER and SMTP_PORT are correct.")
        return False
