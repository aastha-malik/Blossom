import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Robust .env loading (Only load if vars aren't already set by Render)
def load_app_env():
    # Load .env but DON'T override existing environment variables (Render's variables take priority)
    load_dotenv()
    base_dir = os.path.dirname(os.path.abspath(__file__))
    env_path = os.path.join(base_dir, ".env")
    if os.path.exists(env_path):
        load_dotenv(env_path, override=False)

load_app_env()

def mask_credential(val):
    if not val: return "NOT SET"
    if len(val) < 4: return "****"
    return f"{val[:2]}****{val[-2:]}"

def send_email(to_email, subject, body, retry_with_465=True):
    # Ensure any quotes or whitespaces are removed
    def clean_env(key):
        val = os.getenv(key, "")
        if not val: return ""
        return val.strip().strip('"').strip("'")

    smtp_server = clean_env("SMTP_SERVER")
    smtp_port = clean_env("SMTP_PORT")
    email_address = clean_env("EMAIL_ADDRESS")
    email_password = clean_env("EMAIL_PASSWORD")

    if not all([smtp_server, smtp_port, email_address, email_password]):
        print(f"❌ CRITICAL: Missing email configuration.")
        return False

    msg = MIMEMultipart()
    msg["From"] = email_address
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        port = int(smtp_port)
        print(f"DEBUG: Email Attempt for {to_email} on port {port}")
        
        if port == 465:
            server = smtplib.SMTP_SSL(smtp_server, port, timeout=20)
            server.ehlo()
        else:
            server = smtplib.SMTP(smtp_server, port, timeout=20)
            server.ehlo()
            server.starttls()
            server.ehlo()
            
        server.login(email_address, email_password)
        server.send_message(msg)
        server.quit()
        print(f"✅ SUCCESS: Email sent to {to_email}")
        return True

    except Exception as e:
        error_msg = str(e)
        print(f"❌ ERROR: Failed on port {smtp_port}: {error_msg}")
        
        # Fallback Logic: If 587 is blocked by network, try 465 automatically
        if retry_with_465 and smtp_port == "587":
            print("⚠️ Port 587 seems blocked. Falling back to Port 465 (SSL)...")
            # Create a localized environment override for the retry
            os.environ["SMTP_PORT"] = "465" 
            return send_email(to_email, subject, body, retry_with_465=False)
            
        if "535" in error_msg:
            print("💡 TIP: Gmail rejected credentials. Re-check your App Password.")
        return False
