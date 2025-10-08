from sqlmodel import Session, select

from src.models.db_models import Performance


class PerformanceService:
    def delete_performance(self, session: Session, student_id: int, course_id: int) -> bool:
        statement = (
            select(Performance)
            .where(Performance.student_id == student_id)
            .where(Performance.course_id == course_id)
        )
        result = session.exec(statement).one()
        session.delete(result)
        session.commit()
        return True

    def add_performance(self, session: Session, performance: Performance) -> Performance:
        session.add(performance)
        session.commit()
        session.refresh(performance)
        return performance

    def select_performance_by_student_id(self, session: Session, student_id: int) -> list[Performance]:
        statement = select(Performance).where(Performance.student_id == student_id)
        result = session.exec(statement)
        return [x for x in result]

    def update_performance(self, session: Session, performance: Performance) -> Performance:
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
