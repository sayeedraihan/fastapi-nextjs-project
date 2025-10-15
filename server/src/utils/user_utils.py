from datetime import timedelta, datetime, timezone
from typing import Annotated

from fastapi.security import OAuth2PasswordRequestForm

import jwt # type: ignore
from fastapi import Depends, HTTPException
from jwt import InvalidTokenError # type: ignore
from sqlmodel import Session
from starlette import status
from starlette.requests import Request

from src.utils.base_utils import Role
from src.models.db_models import User
from src.db_init import get_session
from src.service.user_service import user_service
from src.models.token import TokenData
from src.utils.authentication_utils import verify_password, SECRET_KEY, ALGORITHM, oauth2_scheme

# authenticate the user
def authenticate_user(session: Session, form_data: OAuth2PasswordRequestForm):
    user = user_service.select_users_by_username(session, form_data.username)
    if not user:
        return None
    if not verify_password(form_data.password, user.password):
        return None
    return user

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
        role = payload.get("role")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except InvalidTokenError:
        raise credentials_exception
    user = user_service.select_users_by_username(session=session, username=token_data.username)
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

def role_checker(allowed_roles: list[Role]):
    def check_roles(current_user: User = Depends(get_current_active_user)):
        if current_user.role not in [role.value for role in allowed_roles]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource"
            )
        return current_user
    return check_roles

