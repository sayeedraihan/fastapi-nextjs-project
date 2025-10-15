from typing import Optional
from sqlmodel import Session, select
from starlette.requests import Request

from src.service.student_service import student_service
from src.models.request_response_models import AddUserRequest
from src.models.db_models import User
from src.utils.authentication_utils import get_password_hash

class UserService:

    @staticmethod
    def select_users_by_username(session: Session, username: str) -> User | None:
        statement = select(User).where(User.username == username)
        user = session.exec(statement).first()
        return user

    @staticmethod
    def check_existing_user(func):
        def wrapper(*args, **kwargs):
            existing_user: User = UserService.select_users_by_username(args[1], args[2].username)
            if existing_user:
                return UserService.update_user(args[1], args[2])
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
    def add_user(self, session: Session, user: User, student_id: Optional[int]) -> User:
        user.password = get_password_hash(user.password)
        session.add(user)
        user.id = None
        session.commit()
        session.refresh(user)
        return user

    @staticmethod
    def update_user(session: Session, user: User) -> User:
        statement = select(User).where(User.id == user.id)
        existing_user = session.exec(statement).first()
        if existing_user:
            existing_user.username = user.username
            existing_user.password = get_password_hash(user.password)
            session.add(existing_user)
            session.commit()
            session.refresh(existing_user)
        return existing_user

user_service = UserService()