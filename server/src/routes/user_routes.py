from typing import Optional

from fastapi import Depends, HTTPException
from sqlmodel import Session
from starlette import status
from starlette.requests import Request

from src.app import get_session
from src.service.user.user_service import UserService
from src.models.user import User, UserBase
from src.routes.base_routes import get_router

router = get_router()

user_service = UserService()

@router.put("/add-admin")
def add_admin_user(*, session: Session = Depends(get_session), request: Request):
    user: User = User(
        id=None,
        username="admin",
        email="admin@example.com",
        full_name="System Administrator",
        password="$2a$12$SW5CVGYA8fjUJKPKqEQtHOZLsDXDgAGI1Prb/EoAVKyNt4pxL8trW"
    )
    request.session["user_new"] = dict(user)
    request.session["username"] = user.username
    request.session["password"] = user.password
    user = user_service.add_user(session, request)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

@router.put("/add-user")
def add_new_user(*, session: Session = Depends(get_session), user_new: Optional[UserBase] = None, request: Request):
    user: User = User(**dict(user_new))
    user.id = -1
    request.session["user_new"] = dict(user)
    request.session["username"] = user.username
    request.session["password"] = user.password
    user = user_service.add_user(session, request)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

@router.get("/get-user/{username}")
def get_user_by_username(*, session: Session = Depends(get_session), username: Optional[str] = "admin", request: Request):
    user: User = User()
    user.id = -1
    user.username = username
    request.session["username"] = user.username
    user = user_service.select_users_by_username(session, request)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user