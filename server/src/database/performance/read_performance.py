from sqlmodel import Session, select

from src.models.db_models import Performance


def select_performance_by_student_id(session: Session, student_id: int) -> list[Performance]:
    statement = select(Performance).where(Performance.student_id == student_id)
    result = session.exec(statement)
    return [x for x in result]