import os
from email_verify import send_email, mask_credential

def run_diagnostic():
    # Attempt to read env vars
    email = os.getenv("EMAIL_ADDRESS")
    print("--- Blossom Email Diagnostic ---")
    if not email:
        print("❌ Could not find environment variables.")
        print("Make sure you are running this from the directory containing .env")
    else:
        print(f"Found User: {mask_credential(email)}")
        print("Attempting to send a test email to YOURSELF...")
        
        # Test sending to self
        success = send_email(email, "Blossom Diagnostic Test", "If you got this, the connection is 100% fixed!")
        
        if success:
            print("\n🎉 DIAGNOSTIC PASSED!")
            print("Check your email (including Spam folder).")
        else:
            print("\n❌ DIAGNOSTIC FAILED.")
            print("Look at the DEBUG steps above to see where it stopped.")

if __name__ == "__main__":
    run_diagnostic()
