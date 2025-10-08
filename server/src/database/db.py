import os
from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy import inspect
from src.models.user import User
from src.models.course import Course
from src.models.performance import Performance
from src.models.student import Student
from src.utils.user_utils import get_password_hash

sqlite_file_name = 'basic.db'
sqlite_url = f"sqlite:///{sqlite_file_name}"


def create_db_and_tables():
    engine = create_engine(sqlite_url, echo=True)
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        admin_user = User(
            username='admin',
            email='admin@example.com',
            full_name='System Administrator',
            disabled=False,
            password=get_password_hash('admin')
        )
        session.add(admin_user)
        session.commit()
    return engine


if not os.path.exists(sqlite_file_name):
    engine = create_db_and_tables()
else:
    engine = create_engine(sqlite_url, echo=True)
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    if not tables:
        SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        try:
            yield session
        finally:
            print("\n\nClosing DB Session\n\n")