from datetime import timedelta
from typing import Annotated

from fastapi import Depends, APIRouter, HTTPException, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session
from starlette import status

from src.models.request_response_models import LoginResponse
from src.models.db_models import Student, User
from src.service.student_service import student_service
from src.db_init import get_session
from src.models.token import Token
from src.routes.base_routes import get_router
from src.utils.authentication_utils import ACCESS_TOKEN_EXPIRE_MINUTES
from src.utils.user_utils import get_current_active_user, \
    authenticate_user, create_access_token

router: APIRouter = get_router()

@router.post("/get-token")
def get_token(*, session: Session = Depends(get_session),
                    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
                    request: Request) -> LoginResponse:
    user: User = authenticate_user(session, form_data)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.username, "role": user.role}, expires_delta=access_token_expires)
    token: Token = Token(access_token=access_token, token_type="bearer")

    student_details: Student | None = None
    if user.role == "S":
        student_details = student_service.get_student_details_by_user_id(session, user.id)
    login_response: LoginResponse = LoginResponse(
        token = token, 
        student = student_details,
        role = user.role
    )
    return login_response

@router.get("/users/me", response_model=User)
async def read_users_me(current_user: Annotated[User, Depends(get_current_active_user)]):
    return current_user

