from typing import Annotated, Dict, Optional

from fastapi import Depends, HTTPException
from sqlmodel import Session
from starlette import status
from starlette.requests import Request

from src.service.student_service import student_service
from src.models.request_response_models import AddUserRequest
from src.utils.user_utils import role_checker
from src.utils.base_utils import Role
from src.models.db_models import User
from src.db_init import get_session
from src.service.user_service import user_service
from src.models.user import UserBase
from src.routes.base_routes import get_router

router = get_router()
admin_dependency = Depends(role_checker([Role.ADMIN]))

@router.put("/add-admin")
def add_admin_user(*, session: Session = Depends(get_session), request: Request):
    user: User = User(
        id=None,
        username="admin",
        email="admin@example.com",
        full_name="System Administrator",
        password="$2a$12$SW5CVGYA8fjUJKPKqEQtHOZLsDXDgAGI1Prb/EoAVKyNt4pxL8trW",
        role="A"
    )
    request.session["user_new"] = dict(user)
    request.session["username"] = user.username
    request.session["password"] = user.password
    user = user_service.add_user(session, user)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

@router.put("/add-user")
def add_new_user(*, session: Session = Depends(get_session),
                 request: AddUserRequest, 
                 current_user: Annotated[User, admin_dependency]):
    user: User = User(
        username = request.username,
        password = request.password,
        role = request.role
    )
    user.id = -1
    new_user = user_service.add_user(session, user, request.student_id)
    if not new_user:

        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if request.role == "S":
        student_service.update_student_user_id(session, request.student_id, new_user.id)
    return new_user

@router.get("/get-user/{username}")
def get_user_by_username(*, session: Session = Depends(get_session), 
                         add_user_request: AddUserRequest, 
                         request: Request, 
                         current_user: Annotated[User, admin_dependency]):
    user: User = User()
    user.id = -1
    user.username = request.username
    request.session["username"] = user.username
    user = user_service.select_users_by_username(session, request)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user
