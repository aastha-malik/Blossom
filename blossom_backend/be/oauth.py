from authlib.integrations.starlette_client import OAuth
import os
from dotenv import load_dotenv
load_dotenv()


oauth = OAuth()





google_client_id = os.getenv("GOOGLE_CLIENT_ID")
google_client_secret = os.getenv("GOOGLE_CLIENT_SECRET")

if not google_client_id or not google_client_secret:
    print("WARNING: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing. Google Login will fail.")

oauth.register(
    name="google",
    client_id=google_client_id,
    client_secret=google_client_secret,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={
        "scope": "openid email profile"
    }
)
print(f"OAuth configured. Client ID present: {bool(google_client_id)}")
