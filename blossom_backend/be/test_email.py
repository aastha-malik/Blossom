import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Load env from be/.env
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

def test_email():
    smtp_server = os.getenv("SMTP_SERVER", "").strip().strip('"').strip("'")
    smtp_port = os.getenv("SMTP_PORT", "").strip().strip('"').strip("'")
    email_address = os.getenv("EMAIL_ADDRESS", "").strip().strip('"').strip("'")
    email_password = os.getenv("EMAIL_PASSWORD", "").strip().strip('"').strip("'")

    print(f"Testing with: SERVER={smtp_server}, PORT={smtp_port}, EMAIL={email_address}")
    
    if not all([smtp_server, smtp_port, email_address, email_password]):
        print("❌ Missing configuration in .env")
        return

    msg = MIMEMultipart()
    msg["From"] = email_address
    msg["To"] = email_address # Send to self
    msg["Subject"] = "Blossom SMTP Test"
    msg.attach(MIMEText("If you see this, your SMTP settings are working!", "plain"))

    try:
        port = int(smtp_port)
        if port == 465:
            server = smtplib.SMTP_SSL(smtp_server, port, timeout=10)
        else:
            server = smtplib.SMTP(smtp_server, port, timeout=10)
            server.starttls()
            
        server.login(email_address, email_password)
        server.send_message(msg)
        server.quit()
        print("✅ Success! Check your inbox.")
    except Exception as e:
        print(f"❌ Failed: {str(e)}")

if __name__ == "__main__":
    test_email()
