import os
import requests
from dotenv import load_dotenv

# Load env
load_dotenv()

def send_email(to_email, subject, body):
    api_key = os.getenv("RESEND_API_KEY")
    
    if not api_key:
        print("❌ ERROR: RESEND_API_KEY is not set in environment variables.")
        # FALLBACK: If API key is missing, we will print the OTP to the logs 
        # so the user can at least see it in Render logs to "verify" manually.
        print(f"DEBUG: [FALLBACK] Email would have been sent to {to_email}")
        print(f"DEBUG: [FALLBACK] Subject: {subject}")
        print(f"DEBUG: [FALLBACK] Body: {body}")
        return False

    try:
        # GIANT FAIL-SAFE LOG (So you can see the code even if email fails)
        print("\n" + "="*50)
        print(f"🔑 SECURITY OTP FOR {to_email}:")
        print(f"👉 {body} 👈")
        print("="*50 + "\n")

        print(f"DEBUG: Sending email via Resend API to {to_email}...")
        response = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "from": "Blossom App <onboarding@resend.dev>",
                "to": to_email,
                "subject": subject,
                "text": body,
            },
            timeout=10
        )
        
        if response.status_code in [200, 201]:
            print(f"✅ SUCCESS: Email sent via Resend to {to_email}")
            return True
        else:
            print(f"❌ ERROR: Resend API failed with status {response.status_code}")
            print(f"❌ ERROR DETAIL: {response.text}")
            return False

    except Exception as e:
        print(f"❌ ERROR: Exception during Resend API call: {str(e)}")
        return False
