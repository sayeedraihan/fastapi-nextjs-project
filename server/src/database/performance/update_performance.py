from sqlmodel import Session, select

from src.models.db_models import Performance


def update_performance(session: Session, performance: Performance) -> Performance:
    statement = select(Performance).where(Performance.student_id == performance.student_id)
    result = session.exec(statement).one()

    result.attendance = performance.attendance
    result.semester = performance.semester
    result.practical = performance.practical
    result.in_course = performance.in_course

    session.add(result)
    session.commit()
    session.refresh(result)
    return result
