from email_verify import send_email
import random
from auth import pwd_context, truncate_password
from models import User
from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime, timedelta



def to_confirm_email(db:Session, email:str):
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    else:
        email_token = random.randint(100000, 999999)
        user.user_verification_token = str(email_token)
        user.user_verification_token_expires_at = datetime.utcnow() + timedelta(minutes=15)
        db.commit()
        plain = (
            f"Hi {user.username},\n\n"
            f"Your Tendr password reset code is:\n\n"
            f"  {email_token}\n\n"
            f"This code expires in 15 minutes. If you didn't request a reset, you can ignore this email — your account is safe.\n\n"
            f"— The Tendr team"
        )
        html = f"""<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4f0;padding:40px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#faf9f7;border:1px solid #e5e3de;padding:48px 44px;">
        <tr>
          <td style="font-family:'Georgia',serif;font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#9e9b94;padding-bottom:24px;">
            TENDR
          </td>
        </tr>
        <tr>
          <td style="font-family:'Georgia',serif;font-size:28px;font-style:italic;color:#1a1916;padding-bottom:8px;line-height:1.2;">
            Reset your password.
          </td>
        </tr>
        <tr>
          <td style="font-family:'Georgia',serif;font-size:15px;color:#6b6860;padding-bottom:32px;line-height:1.6;">
            Hi {user.username}, here's your one-time code.
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-bottom:32px;">
            <div style="display:inline-block;background:#1a1916;color:#faf9f7;font-family:'Courier New',monospace;font-size:36px;letter-spacing:10px;padding:20px 36px;">
              {email_token}
            </div>
          </td>
        </tr>
        <tr>
          <td style="font-family:'Georgia',serif;font-size:13px;color:#9e9b94;padding-bottom:24px;line-height:1.6;border-top:1px solid #e5e3de;padding-top:24px;">
            This code expires in <strong>15 minutes</strong>. If you didn't request a password reset, you can safely ignore this email.
          </td>
        </tr>
        <tr>
          <td style="font-family:'Georgia',serif;font-size:12px;color:#c4c1ba;letter-spacing:1px;">
            — The Tendr team
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""
        success = send_email(user.email, "Your Tendr reset code", plain, html_body=html)
        if success:
            print(f"✅ Password reset OTP sent to {user.email}")
        else:
            print(f"❌ CRITICAL: Failed to send password reset OTP to {user.email}")
        
        return {"message": "OTP processed"}


from sqlalchemy import or_

def forget_password(db:Session, entered_verify_code:str, identity:str, new_password:str, new_password_confirm:str):
    user = db.query(User).filter(or_(User.username == identity, User.email == identity)).first()
    if user:
        if entered_verify_code == user.user_verification_token :
            if user.user_verification_token_expires_at > datetime.utcnow():
                if new_password == new_password_confirm:
                    # Truncate password to 72 bytes (bcrypt limit)
                    truncated_password = truncate_password(new_password)
                    hashed_password = pwd_context.hash(truncated_password)
                    user.hashed_password = hashed_password
                    # If this was a Google user, allow them to log in with their new password now
                    user.provider = None 
                    db.commit()
                    db.refresh(user)
                    return True
                else:
                    print("new_password != new_password_confirm")
                    return False  # Return False for password mismatch
            else:
                print("Times Up to verify email!")
                return False  # Return False for expired token
        else:
            print("Verification code doesn't match")
            return False  # Return False for token mismatch
    else:
        print("User not found")
        return False  # Return False for user not found
        

