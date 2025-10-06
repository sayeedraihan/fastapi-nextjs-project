from sqlmodel import Session

from src.models.db_models import Student


def add_demo_students(session: Session) -> list[Student]:
    student_01 = Student(name = 'Sayeed', roll = 12, level = 'Ten', section = 'A1')
    student_02 = Student(name = 'Raihan', roll = 15, level = 'Nine', section = 'A2')
    student_03 = Student(name = 'Sayem', roll = 8, level = 'Six', section = 'B2')

    session.add(student_01)
    session.add(student_02)
    session.add(student_03)

    session.commit()

    session.refresh(student_01)
    session.refresh(student_02)
    session.refresh(student_03)
    return [student_01, student_02, student_03]

def add_student(session: Session):
    student = getattr(session, 'student')
    session.add(student)
    student.id = None
    session.commit()
    session.refresh(student)
    return student

