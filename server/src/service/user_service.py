from typing import Optional
from sqlmodel import Session, select, update
from starlette.requests import Request

from src.service.student_service import student_service
from src.models.request_response_models import AddUserRequest
from src.models.db_models import User
from src.utils.authentication_utils import get_password_hash
from datetime import datetime, timezone

class UserService:

    @staticmethod
    def select_users_by_username(session: Session, username: str) -> User | None:
        statement = select(User).where(User.username == username)
        user = session.exec(statement).first()
        return user
    
    @staticmethod
    def select_user_by_id(session: Session, user_id: int) -> User | None:
        statement = select(User).where(User.id == user_id)
        user = session.exec(statement).first()
        return user

    @staticmethod
    def check_existing_user(func):
        def wrapper(*args, **kwargs):
            existing_user: User = UserService.select_users_by_username(args[1], args[2].username)
            if existing_user:
                return UserService.update_user(args[1], existing_user.id, args[2], args[3])
            return func(*args, **kwargs)

        return wrapper

    @staticmethod
    def check_user_availability(func):
        def wrapper(*args, **kwargs):
            existing_user: User = UserService.select_users_by_username(args[1], args[2].session.get("username"))
            if existing_user:
                return func(*args, **kwargs)
            return None

        return wrapper

    @check_existing_user
    def add_user(self, session: Session, user: User, creator_username: Optional[str]) -> User:
        user.password = get_password_hash(user.password)
        user.created_at = datetime.now(timezone.utc) 
        user.created_by = creator_username
        user.updated_at = datetime.now(timezone.utc) 
        user.updated_by = creator_username
        session.add(user)
        session.commit()
        session.refresh(user)
        return user

    @staticmethod
    def update_user(session: Session, user_id: int, updated_user: User, updated_by: str) -> User:
        statement = select(User).where(User.id == user_id)
        existing_user = session.exec(statement).first()
        if existing_user:
            existing_user.password = get_password_hash(updated_user.password)
            existing_user.updated_at = datetime.now(timezone.utc)
            existing_user.updated_by = updated_by
            session.add(existing_user)
            session.commit()
            session.refresh(existing_user)
        return existing_user

user_service = UserService()