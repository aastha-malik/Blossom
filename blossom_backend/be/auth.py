from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def truncate_password(password: str, max_bytes: int = 72) -> str:
    """
    Truncate password to max_bytes to comply with bcrypt's 72-byte limit.
    Handles multi-byte characters properly.

    password.encode('utf-8')=> give the bytes of the password
    """
    password_bytes = password.encode('utf-8')[:max_bytes]
    return password_bytes.decode('utf-8', errors='ignore')

# to hash the password 
# hashes_password = pwd_context.hash(truncate_password("plainpassword"))

#to verify
# pwd_context.verify(truncate_password("plainpassword"), hashes_password)