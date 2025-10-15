from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext # type: ignore

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="get-token") # the 'get-token' url will use authentication

# open git bash and run 'openssl rand -hex 32' command to generate a code like below
SECRET_KEY = "672651c34f6ed00bc275928112ea76f413bec7896e71814ff5f2e64d7c204ea5"

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# verify if a received password matches with the hashed password
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# hash a password coming from the user
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)