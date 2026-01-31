import os
import requests
from dotenv import load_dotenv

# Load env
load_dotenv()

def send_email(to_email, subject, body):
    api_key = os.getenv("RESEND_API_KEY")
    
    # ALWAYS print the OTP to logs as a fail-safe first
    print("\n" + "!"*60)
    print(f"🔑 SECURITY OTP FOR: {to_email}")
    print(f"👉 CODE: {body} 👈")
    print("!"*60 + "\n")
    
    if not api_key:
        print("❌ ERROR: RESEND_API_KEY is missing in Render settings.")
        return False

    try:
        print(f"DEBUG: Requesting Resend API for {to_email}...")
        response = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "from": "Blossom <onboarding@resend.dev>",
                "to": to_email,
                "subject": subject,
                "text": body,
            },
            timeout=10
        )
        
        if response.status_code in [200, 201]:
            print(f"✅ SUCCESS: Email sent to {to_email}")
            return True
        elif response.status_code == 403:
            print(f"⚠️ RESEND RESTRICTION: You can ONLY send emails to the address you used to sign up for Resend.")
            print(f"💡 TIP: Try signing up to Blossom with the same email you used for your Resend account.")
            return False
        else:
            print(f"❌ ERROR: Resend API failed (Status {response.status_code})")
            return False

    except Exception as e:
        print(f"❌ ERROR: Connection failed: {str(e)}")
        return False
