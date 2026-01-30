import email
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from sqlalchemy.orm import Session

from models import User
import random
from dotenv import load_dotenv
load_dotenv()

def send_email(to_email, subject, body):
    smtp_server = os.getenv("SMTP_SERVER")
    smtp_port = os.getenv("SMTP_PORT")
    email_address = os.getenv("EMAIL_ADDRESS")
    email_password = os.getenv("EMAIL_PASSWORD")

    if not all([smtp_server, smtp_port, email_address, email_password]):
        print(f"❌ Missing email configuration: SERVER={smtp_server}, PORT={smtp_port}, EMAIL={email_address}")
        return False

    msg = MIMEMultipart()
    msg["From"] = email_address
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        # Port must be integer for smtplib
        port = int(smtp_port)
        
        # Use SMTP_SSL for port 465, otherwise use SMTP + starttls
        if port == 465:
            server = smtplib.SMTP_SSL(smtp_server, port, timeout=10)
        else:
            server = smtplib.SMTP(smtp_server, port, timeout=10)
            server.starttls()
            
        server.login(email_address, email_password)
        server.send_message(msg)
        server.quit()
        print("✅ Email sent successfully!")
        return True
    except Exception as e:
        print(f"❌ Failed to send email: {str(e)}")
        # If it's a connection issue, try to be more specific
        if "connect() first" in str(e):
             print("TIP: The SMTP server refused the connection or the host/port is incorrect.")
        return False


# email_token = random.randint(99999, 1000000)  #picks up the random for verification
# email_body = f" Hello! Please verify your Email for Blossom  {email_token}  Thank you!" # body of email app will send to user for verification

# # Try it
# # send_email(User(email), "Email Verification", email_body) #checking whether email is send or not
