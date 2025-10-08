from sqlmodel import Session, select
from starlette.requests import Request

from src.models.user import User
from src.utils.user_utils import get_password_hash


class UserService:
    def select_users_by_username(self, session: Session, request: Request) -> User | None:
        statement = select(User).where(User.username == request.session.get("username"))
        user = session.exec(statement).first()
        return user

    def select_users_by_raw_username(self, session: Session, username: str) -> User | None:
        statement = select(User).where(User.username == username)
        user = session.exec(statement).first()
        return user

    def check_existing_user(self, func):
        def wrapper(*args, **kwargs):
            existing_user: User = self.select_users_by_username(args[0], args[1])
            if existing_user:
                return None
            return func(*args, **kwargs)

        return wrapper

    def check_user_availability(self, func):
        def wrapper(*args, **kwargs):
            existing_user: User = self.select_users_by_username(args[0], args[1])
            if existing_user:
                return func(*args, **kwargs)
            return None

        return wrapper

    @check_existing_user
    def add_admin_user(self, session: Session, request: Request) -> User:
        admin_user = User(
            username=request.session.get('admin'),
            email='admin@example.com',
            full_name='System Administrator',
            disabled=False,
            id=None,
            password="$2a$12$SW5CVGYA8fjUJKPKqEQtHOZLsDXDgAGI1Prb/EoAVKyNt4pxL8trW"  # password = admin
        )

        session.add(admin_user)
        session.commit()
        session.refresh(admin_user)
        return admin_user

    @check_existing_user
    def add_user(self, session: Session, request: Request) -> User:
        user: User = User(**request.session.get("user_new"))
        user.password = get_password_hash(user.password)
        session.add(user)
        session.commit()
        session.refresh(user)
        return user
