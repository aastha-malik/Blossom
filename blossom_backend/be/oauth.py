from authlib.integrations.starlette_client import OAuth
import os
from dotenv import load_dotenv
load_dotenv()


oauth = OAuth()




oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={
        "scope": "openid email profile"
    }
)
print("Client ID is:", os.environ.get("GOOGLE_CLIENT_ID"))
