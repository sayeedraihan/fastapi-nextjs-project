from fastapi import HTTPException, status
from sqlmodel import Session, select
from datetime import datetime, timezone

from src.models.db_models import Course, Performance


class CourseService:
    @staticmethod
    def select_all_courses(session: Session) -> list[Course]:
        statement = select(Course)
        results = session.exec(statement)
        return [x for x in results]

    @staticmethod
    def select_course_by_id(session: Session, course_id: int):
        statement = select(Course).where(Course.id == course_id)
        course = session.exec(statement).first()
        if not course:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
        return course

    @staticmethod
    def select_courses_by_filter(session: Session):
        prop: str = getattr(session, 'property', None)
        value: str | float = getattr(session, 'value', None)
        if property == "credits":
            value = float(value)
        if value == '' and prop == '':
            statement = select(Course)
        else:
            statement = select(Course).where(getattr(Course, prop) == value)
        results = session.exec(statement).all()
        return results

    @staticmethod
    def add_course(session: Session, course: Course, creator_username: str) -> Course:
        course.created_at = datetime.now(timezone.utc)
        course.created_by = creator_username
        course.updated_at = datetime.now(timezone.utc)
        course.updated_by = creator_username
        session.add(course)
        session.commit()
        session.refresh(course)
        return course

    @staticmethod
    def update_course(session: Session, course_id: int, course_data: Course, updater_username: str) -> Course:
        course = CourseService.select_course_by_id(session, course_id)
        course.name = course_data.name
        course.course_code = course_data.course_code
        course.description = course_data.description
        course.credits = course_data.credits
        course.updated_at = datetime.now(timezone.utc)
        course.updated_by = updater_username
        session.add(course)
        session.commit()
        session.refresh(course)
        return course

    @staticmethod
    def delete_course(session: Session, course_id: int) -> bool:
        # Also delete related performance records
        statement = select(Performance).where(Performance.course_id == course_id)
        results = session.exec(statement).all()
        for result in results:
            session.delete(result)

        course = CourseService.select_course_by_id(session, course_id)
        session.delete(course)
        session.commit()
        return True

    @staticmethod
    def select_courses_by_student_id(session: Session, student_id: int) -> list[Course]:
        statement = (
            select(Course)
            .join(Performance)
            .where(Performance.student_id == student_id)
        )
        results = session.exec(statement).all()
        return results

course_service = CourseService()