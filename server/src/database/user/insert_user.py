from starlette.requests import Request

from src.database.user.read_user import check_existing_user

from sqlmodel import Session

from src.models.user import User
from src.utils.user_utils import get_password_hash


@check_existing_user
def add_admin_user(session: Session, request: Request) -> User:
    admin_user = User(
        username = request.session.get('admin'),
        email = 'admin@example.com',
        full_name = 'System Administrator',
        disabled = False,
        id = None,
        password = "$2a$12$SW5CVGYA8fjUJKPKqEQtHOZLsDXDgAGI1Prb/EoAVKyNt4pxL8trW" # password = admin
    )

    session.add(admin_user)
    session.commit()
    session.refresh(admin_user)
    return admin_user

@check_existing_user
def add_user(session: Session, request: Request) -> User:
    user: User = User(**request.session.get("user_new"))
    user.password = get_password_hash(user.password)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

