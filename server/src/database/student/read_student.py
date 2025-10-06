from sqlmodel import Session, select

from src.models.db_models import Student


def select_all_students(session: Session):
    statement = select(Student)
    results = session.exec(statement)
    return [x for x in results]

def select_student_by_id(session: Session):
    statement = select(Student).where(Student.id == getattr(session, 'id', -1))
    students = session.exec(statement).all()
    return students

def select_student_by_id_v2(session: Session, id: int):
    statement = select(Student).where(Student.id == id)
    students = session.exec(statement).all()
    return students

def select_students_by_filter(session: Session):
    prop: str = getattr(session, 'property', None)
    value: str | int = getattr(session, 'value', None)
    if property == "roll":
        value = int(value)
    if value == '<>' and prop == '<>':
        statement = select(Student)
    else:
        statement = select(Student).where(getattr(Student, prop) == value)
    results = session.exec(statement).all()
    return results