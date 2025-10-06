from sqlmodel import Session, select
from starlette.requests import Request

from src.models.user import User


def select_users_by_username(session: Session, request: Request) -> User | None:
    statement = select(User).where(User.username == request.session.get("username"))
    user = session.exec(statement).first()
    return user

def select_users_by_raw_username(session: Session, username: str) -> User | None:
    statement = select(User).where(User.username == username)
    user = session.exec(statement).first()
    return user

def check_existing_user(func):
    def wrapper(*args, **kwargs):
        existing_user: User = select_users_by_username(args[0], args[1])
        if existing_user:
            return None
        return func(*args, **kwargs)
    return wrapper

def check_user_availability(func):
    def wrapper(*args, **kwargs):
        existing_user: User = select_users_by_username(args[0], args[1])
        if existing_user:
            return func(*args, **kwargs)
        return None
    return wrapper
