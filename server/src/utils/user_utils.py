from datetime import timedelta, datetime, timezone
from typing import Annotated, MutableMapping

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jwt import InvalidTokenError
from passlib.context import CryptContext
from sqlmodel import Session
from starlette import status
from starlette.requests import Request

from src.app import get_session
from src.service.user.user_service import UserService
from src.models.token import TokenData
from src.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="get-token") # the 'get-token' url will use authentication

# open git bash and run 'openssl rand -hex 32' command to generate a code like below
SECRET_KEY = "672651c34f6ed00bc275928112ea76f413bec7896e71814ff5f2e64d7c204ea5"

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

user_service = UserService()

# verify if a received password matches with the hashed password
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# hash a password coming from the user
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# need to modify this method to use User table
def get_user(db, username: str):
    if username in db:
        user_dict = db[username]
        return User(**user_dict)
    return None

# authenticate the user
def authenticate_user(session: Session, request: Request):
    # user = get_user(fake_db, username)
    user = user_service.select_users_by_username(session, request)
    if not user: # user does not exist
        return None
    if not verify_password(request.session.get("password"), user.password): # password did not match
        return None
    return user # authenticated

# creates a jwt access token (jwt = JSON Web Token)
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt



# called to fetch the current user from the fake_users_db dictionary. I need to update it for DB related ops.
async def get_current_user(*, session: Session = Depends(get_session), token: Annotated[str, Depends(oauth2_scheme)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except InvalidTokenError:
        raise credentials_exception
    user = user_service.select_users_by_raw_username(session=session, username=token_data.username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with username '{token_data.username}' not found",
        )
    return user

async def get_current_active_user(current_user: Annotated[User, Depends(get_current_user)]):
    if current_user.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user

