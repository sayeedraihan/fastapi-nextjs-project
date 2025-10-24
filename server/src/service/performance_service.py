from sqlmodel import Session, select, update
from datetime import datetime, timezone

from src.models.db_models import Performance


class PerformanceService:
    def delete_performance(self, session: Session, student_id: int, course_id: int, updated_by: str) -> bool:
        statement = (
            update(Performance)
            .where(Performance.student_id == student_id)
            .where(Performance.course_id == course_id)
            .values(
                updated_by=updated_by,
                status="I"
            )
        )
        session.exec(statement)
        session.commit()
        return True

    @staticmethod
    def add_performance(session: Session, performance: Performance, creator_username: str) -> Performance:
        performance.created_by = creator_username
        performance.updated_by = creator_username
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
    def update_performance(session: Session, performance: Performance, updater_username: str) -> Performance:
        statement = select(Performance).where(Performance.student_id == performance.student_id, Performance.course_id == performance.course_id)
        result = session.exec(statement).one()

        result.attendance = performance.attendance
        result.semester = performance.semester
        result.practical = performance.practical
        result.in_course = performance.in_course

        result.updated_by = updater_username

        session.add(result)
        session.commit()
        session.refresh(result)
        return result


performance_service = PerformanceService()