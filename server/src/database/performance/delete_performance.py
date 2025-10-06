from sqlmodel import Session, select

from src.models.db_models import Performance

def delete_performance(session: Session, student_id: int, course_id: int) -> bool:
    statement = (select(Performance).where(Performance.student_id == student_id)
                 .where(Performance.course_id == course_id))
    result = session.exec(statement).one()
    session.delete(result)
    session.commit()
    return True
