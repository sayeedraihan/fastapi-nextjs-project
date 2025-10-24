from sqlalchemy import create_engine, text
from sqlmodel import SQLModel, Session, select
import threading

from src.models.db_models import User
from src.env import sqlite_url
from src.utils.authentication_utils import get_password_hash

# Global lock for serializing database access
db_lock = threading.Lock()

# Define the engine globally. 
# connect_args is needed for SQLite to work with multiple threads, which FastAPI can use.
engine = create_engine(sqlite_url, echo=True, connect_args={"check_same_thread": False})

# --- SQL Triggers ---
TRIGGER_STUDENT_UPDATED_AT = """
CREATE TRIGGER IF NOT EXISTS trigger_student_updated_at
AFTER UPDATE ON student
FOR EACH ROW
BEGIN
    UPDATE student
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.id;
END;
"""

TRIGGER_COURSE_UPDATED_AT = """
CREATE TRIGGER IF NOT EXISTS trigger_course_updated_at
AFTER UPDATE ON course
FOR EACH ROW
BEGIN
    UPDATE course
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.id;
END;
"""

TRIGGER_PERFORMANCE_UPDATED_AT = """
CREATE TRIGGER IF NOT EXISTS trigger_performance_updated_at
AFTER UPDATE ON performance
FOR EACH ROW
BEGIN
    UPDATE performance
    SET updated_at = CURRENT_TIMESTAMP
    WHERE course_id = OLD.course_id AND student_id = OLD.student_id;
END;
"""

TRIGGER_USER_UPDATED_AT = """
CREATE TRIGGER IF NOT EXISTS trigger_user_updated_at
AFTER UPDATE ON user
FOR EACH ROW
BEGIN
    UPDATE user
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.id;
END;
"""

def initialize_database():
    """
    Initializes the database. Creates tables if they don't exist,
    and creates the admin user if it doesn't exist.
    """
    # Create tables if they don't exist
    SQLModel.metadata.create_all(engine)

    # Create admin user if it doesn't exist
    with Session(engine) as session:
        
        # Create DB triggers to set updated_at column value if not exists
        session.exec(text(TRIGGER_STUDENT_UPDATED_AT))
        session.exec(text(TRIGGER_COURSE_UPDATED_AT))
        session.exec(text(TRIGGER_PERFORMANCE_UPDATED_AT))
        session.exec(text(TRIGGER_USER_UPDATED_AT))

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
                created_by="SYS",
                updated_by="SYS"
            )
            session.add(admin_user)
            session.commit()

def get_session():
    with db_lock:
        with Session(engine) as session:
            yield session
