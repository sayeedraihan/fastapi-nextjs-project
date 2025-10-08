from sqlmodel import Session, select

from src.models.db_models import Course


class CourseService:
    def select_all_courses(self, session: Session) -> list[Course]:
        statement = select(Course)
        results = session.exec(statement)
        return [x for x in results]

    def select_course_by_id(self, session: Session):
        statement = select(Course).where(Course.id == getattr(session, 'id', -1))
        courses = session.exec(statement).all()
        return courses

    def select_course_by_id_v2(self, session: Session, course_id: int):
        statement = select(Course).where(Course.id == course_id)
        courses = session.exec(statement).all()
        return courses

    def select_courses_by_filter(self, session: Session):
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
