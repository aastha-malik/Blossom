from passlib.context import CryptContext

pwd_context = CryptContext(schemas=["bcrypt"], deprecated="auto")

# to hash the password 
hashes_password = pwd_context.hash("plainpassword")

#to verify
pwd_context.verify("plainpassword", hashes_password)