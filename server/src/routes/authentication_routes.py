from datetime import timedelta
from typing import Annotated, Dict

from fastapi import Depends, APIRouter, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session
from starlette import status
from starlette.requests import Request

from src.app import get_session
from src.models.token import LoginResponse, Token
from src.models.user import User
from src.routes.base_routes import get_router
from src.utils.base_utils import Level, Medium, Field
from src.utils.user_utils import get_current_active_user, \
    authenticate_user, ACCESS_TOKEN_EXPIRE_MINUTES, create_access_token

router: APIRouter = get_router()


@router.post("/get-token")
async def get_token(*, session: Session = Depends(get_session),
                    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
                    request: Request) -> LoginResponse:
    request.session["username"] = form_data.username
    request.session["password"] = form_data.password
    user: User = authenticate_user(session, request)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.username}, expires_delta=access_token_expires)
    token: Token = Token(access_token=access_token, token_type="bearer")
    levels_enum: list[Dict[str, str]] = [ { level.name: level.value } for level in Level]
    mediums_enum: list[Dict[str, str]] = [ { medium.name: medium.value } for medium in Medium]
    fields: list[Dict[str, str]] = [ { field.name: field.value } for field in Field]
    login_response: LoginResponse = LoginResponse(token = token, levels = levels_enum, mediums = mediums_enum, fields = fields)
    return login_response

@router.get("/users/me", response_model=User)
async def read_users_me(current_user: Annotated[User, Depends(get_current_active_user)]):
    return current_user

