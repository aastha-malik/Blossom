import email
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from sqlalchemy.orm import Session

from models import User
import random

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL_ADDRESS = "aasthamalik1810@gmail.com"
EMAIL_PASSWORD = "hpesvflhowhzmzqp"

def send_email(to_email, subject, body):
    msg = MIMEMultipart()
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        server.send_message(msg)
    print("✅ Email sent successfully!")


# email_token = random.randint(99999, 1000000)  #picks up the random for verification
# email_body = f" Hello! Please verify your Email for Blossom  {email_token}  Thank you!" # body of email app will send to user for verification

# # Try it
# send_email(User(email), "Email Verification", email_body) #checking whether email is send or not
