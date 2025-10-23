from sqlalchemy import create_engine, inspect
from sqlmodel import SQLModel, Session, select
import threading

from src.models.db_models import User
from src.env import sqlite_url
from src.utils.authentication_utils import get_password_hash
from datetime import datetime, timezone

# Global lock for serializing database access
db_lock = threading.Lock()

# Define the engine globally. 
# connect_args is needed for SQLite to work with multiple threads, which FastAPI can use.
engine = create_engine(sqlite_url, echo=True, connect_args={"check_same_thread": False})

def initialize_database():
    """
    Initializes the database. Creates tables if they don't exist,
    and creates the admin user if it doesn't exist.
    """
    # Create tables if they don't exist
    SQLModel.metadata.create_all(engine)

    # Create admin user if it doesn't exist
    with Session(engine) as session:
        admin_user = session.exec(select(User).where(User.username == 'admin')).first()
        if not admin_user:
            hashed_password = get_password_hash('admin')
            admin_user = User(
                username='admin',
                email='admin@example.com',
                full_name='System Administrator',
                disabled=False,
                password=hashed_password,
                role="A",
                created_at=datetime.now(timezone.utc),
                created_by="SYS",
                updated_at=datetime.now(timezone.utc),
                updated_by="SYS"
            )
            session.add(admin_user)
            session.commit()

def get_session():
    with db_lock:
        with Session(engine) as session:
            yield session
