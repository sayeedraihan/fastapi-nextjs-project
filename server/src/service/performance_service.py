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

    @staticmethod
    def add_performance(session: Session, performance: Performance) -> Performance:
        session.add(performance)
        session.commit()
        session.refresh(performance)
        return performance

    @staticmethod
    def select_performance_by_student_id(session: Session, student_id: int) -> list[Performance]:
        statement = select(Performance).where(Performance.student_id == student_id)
        result = session.exec(statement)
        return [x for x in result]

    @staticmethod
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


performance_service = PerformanceService()