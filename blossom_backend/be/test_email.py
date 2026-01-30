import os
from email_verify import send_email, mask_credential

def run_diagnostic():
    # Attempt to read env vars
    email = os.getenv("EMAIL_ADDRESS")
    print("--- Blossom Email Diagnostic ---")
    if not email:
        print("❌ Could not find environment variables.")
    else:
        print(f"Found User: {mask_credential(email)}")
        
        print("\n--- TEST 1: Port 587 (Standard) ---")
        success1 = send_email(email, "Blossom Diagnostic Test (587)", "Connection worked on 587!")
        
        if not success1:
            print("\n--- TEST 2: Port 465 (SSL) ---")
            # Update env temporarily for test
            os.environ["SMTP_PORT"] = "465"
            success2 = send_email(email, "Blossom Diagnostic Test (465)", "Connection worked on 465!")
            
            if success2:
                print("\n🎉 TEST 2 PASSED! Updating .env to use port 465.")
                return
        else:
            print("\n🎉 TEST 1 PASSED!")
            return

        print("\n❌ BOTH TESTS FAILED.")
        print("This means the issue is definitely the PASSWORD/CREDENTIALS.")

if __name__ == "__main__":
    run_diagnostic()
