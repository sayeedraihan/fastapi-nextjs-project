from fastapi import HTTPException, status
from sqlmodel import Session

from src.database.student.read_student import select_students_by_filter
from src.models.db_models import Student


def delete_student_by_id(session: Session):
    students: list[Student] = select_students_by_filter(session)
    if not students:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail = "No Student found with the ID")
    for student in students:
        session.delete(student)
    session.commit()
    return students