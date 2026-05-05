import os
import requests
from dotenv import load_dotenv

# Load env
load_dotenv()

def send_email(to_email, subject, body, html_body=None):
    # Try the Google Bridge first (Best for sending to anyone without a domain)
    bridge_url = os.getenv("EMAIL_BRIDGE_URL")
    resend_key = os.getenv("RESEND_API_KEY")
    
    # ALWAYS print the OTP to logs as a fail-safe first
    print("\n" + "!"*60)
    print(f"🔑 SECURITY OTP FOR: {to_email}")
    print(f"👉 CODE: {body} 👈")
    print("!"*60 + "\n")

    # OPTION A: Google Apps Script Bridge (No Domain Needed)
    if bridge_url:
        try:
            print(f"DEBUG: Using Google Bridge to send to {to_email}...")
            response = requests.post(bridge_url, json={
                "to": to_email,
                "subject": subject,
                "body": body
            }, timeout=15)
            if response.status_code == 200:
                print(f"✅ SUCCESS: Email sent via Bridge to {to_email}")
                return True
        except Exception as e:
            print(f"❌ BRIDGE ERROR: {str(e)}")

    # OPTION B: Resend API (Requires Domain for strangers)
    if resend_key:
        try:
            print(f"DEBUG: Using Resend to send to {to_email}...")
            payload = {
                "from": "Tendr <onboarding@resend.dev>",
                "to": to_email,
                "subject": subject,
                "text": body,
            }
            if html_body:
                payload["html"] = html_body
            response = requests.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {resend_key}", "Content-Type": "application/json"},
                json=payload,
                timeout=10
            )
            if response.status_code in [200, 201]:
                print(f"✅ SUCCESS: Email sent via Resend to {to_email}")
                return True
            else:
                print(f"⚠️ RESEND FAILED (Status {response.status_code}). Note: Resend requires a domain to email others.")
        except Exception as e:
            print(f"❌ RESEND ERROR: {str(e)}")

    # If both fail
    print("❌ CRITICAL: No working email path found. OTP only exists in these logs.")
    return False
