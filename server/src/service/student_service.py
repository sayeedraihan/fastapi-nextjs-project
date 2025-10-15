from fastapi import HTTPException, status
from sqlalchemy import func
from sqlmodel import Session, select
from starlette.requests import Request

from src.models.db_models import Student
from src.models.request_response_models import StudentUpdateResponseParams
from src.utils.student_utils import check_existing_student, populate_empty_fields


class StudentService:
    def delete_student_by_id(self, session: Session):
        students: list[Student] = self.select_students_by_filter(session)
        if not students:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No Student found with the ID")
        for student in students:
            session.delete(student)
        session.commit()
        return students

    @staticmethod
    def add_demo_students(session: Session) -> list[Student]:
        student_01 = Student(name='Sayeed', roll=12, level='Ten', section='A1')
        student_02 = Student(name='Raihan', roll=15, level='Nine', section='A2')
        student_03 = Student(name='Sayem', roll=8, level='Six', section='B2')

        session.add(student_01)
        session.add(student_02)
        session.add(student_03)

        session.commit()

        session.refresh(student_01)
        session.refresh(student_02)
        session.refresh(student_03)
        return [student_01, student_02, student_03]

    @staticmethod
    def add_student(session: Session):
        student = getattr(session, 'student')
        session.add(student)
        student.id = None
        session.commit()
        session.refresh(student)
        return student

    @staticmethod
    def select_all_students(session: Session):
        statement = select(Student)
        results = session.exec(statement)
        return [x for x in results]

    @staticmethod
    def select_student_by_id(session: Session):
        statement = select(Student).where(Student.id == getattr(session, 'id', -1))
        students = session.exec(statement).all()
        return students

    @staticmethod
    def select_student_by_id_v2(session: Session, id: int):
        statement = select(Student).where(Student.id == id)
        students = session.exec(statement).all()
        return students

    @staticmethod
    def select_students_by_filter(session: Session):
        prop: str = getattr(session, 'property', None)
        value: str | int = getattr(session, 'value', None)
        if property == "roll":
            value = int(value)
        if value == '' and prop == '':
            statement = select(Student)
        else:
            statement = select(Student).where(getattr(Student, prop) == value)
        results = session.exec(statement).all()
        return results

    @staticmethod
    def get_student_details_by_user_id(session: Session, user_id: int):
        statement = select(Student).where(Student.user_id == user_id)
        result = session.exec(statement).first()
        return result

    @populate_empty_fields
    def update_student_by_id(self, session: Session, request: Request) -> StudentUpdateResponseParams:
        is_duplicate_student: bool = self.get_existing_student(session, request)
        response: StudentUpdateResponseParams = StudentUpdateResponseParams()
        if is_duplicate_student:
            response.response_message = (
                    "Could not update information."
                    + " There already exists a record for student with roll "
                    + str(request.session["updated_student"]["roll"])
                    + " in Class " + request.session["updated_student"]["level"]
                    + " (section " + request.session["updated_student"]["section"] + ")."
                    + " Please check the information again."
            )
        else:
            student_id = request.session["id"]
            updated_student: dict = request.session["updated_student"]
            statement = select(Student).where(Student.id == student_id)
            result = session.exec(statement).first()
            student = result
            for key, value in updated_student.items():
                if key in ['id', 'roll', 'section'] and (
                        value is None or value == "" or ("str" != (str(type(value))[8:11]) and value <= 0)):
                    continue
                else:
                    setattr(student, key, value)
            session.add(student)
            session.commit()
            session.refresh(student)
            response.response_message = (
                    "Record for "
                    + request.session["updated_student"]["name"]
                    + " Updated Successfully"
            )
            response.updated_student = student.model_dump_json()
        return response

    @check_existing_student
    def get_existing_student(self, session: Session, request: Request) -> Student:
        updated_student: dict = request.session["updated_student"]
        statement = (
            select(Student)
            .where(Student.roll == updated_student["roll"])
            .where(Student.level == updated_student["level"])
            .where(Student.section == updated_student["section"])
        )
        results = session.exec(statement)
        existing_students: list[Student] = [x for x in results.all()]
        return existing_students[0] if len(existing_students) and existing_students[0].id != updated_student["id"] else None
    
    @staticmethod
    def select_students_by_class(session: Session) -> dict[str, int]: # gemini
        statement = select(Student.level, func.count(Student.id)).group_by(Student.level) # gemini
        results = session.exec(statement).all() # gemini
        return {level: count for level, count in results} # gemini
    
    @staticmethod
    def select_students_by_class_v2(session: Session) -> {str, int}:
        query = session.exec(Student.level, func.count(Student.id))
        statement = query.group_by(Student.level)
        results = statement.all()
        return results

    @staticmethod
    def update_student_user_id(session: Session, student_id: int, user_id: int) -> Student:
        statement = select(Student).where(Student.id == student_id)
        student = session.exec(statement).first()
        if student:
            student.user_id = user_id
            session.add(student)
            session.commit()
            session.refresh(student)
        return student

student_service = StudentService()