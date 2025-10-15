from sqlmodel import Session, select
from sqlalchemy import func
from src.models.db_models import Performance, Course
from src.service.student_service import student_service

class DashboardService:

    def get_students_per_class(self, session: Session) -> dict[str, int]:
        students_per_class: dict[str, int] = student_service.select_students_by_class(session)
        return students_per_class

    def get_students_per_course(self, session: Session) -> dict[str, int]:
        statement = (
            select(Course.course_code, func.count(Performance.student_id))
            .join(Performance, Course.id == Performance.course_id)
            .group_by(Course.course_code)
        )
        results = session.exec(statement).all()
        return {course_code: count for course_code, count in results}



dashboard_service = DashboardService()