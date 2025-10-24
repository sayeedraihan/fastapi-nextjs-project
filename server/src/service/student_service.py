from math import ceil
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy import func
from sqlmodel import Session, select, update
from starlette.requests import Request
from datetime import datetime, timezone

from src.models.db_models import Student
from src.models.request_response_models import BaseRequestResponse, StudentListResponse, StudentUpdateResponseParams
from src.utils.student_utils import check_existing_student, populate_empty_fields

class StudentService:
    def delete_student_by_id(self, session: Session, prop: str, value: str | int, updated_by: str):
        update_student_statement = (
            update(Student)
            .where(getattr(Student, prop) == value)
            .values(
                updated_by = updated_by,
                status = "I"
            )
        )
        result = session.exec(update_student_statement)
        if result.rowcount == 0:
            return None
        session.commit()
        return BaseRequestResponse(message=f"Successfully updated student(s) where {prop} = {value}")

    @staticmethod
    def add_demo_students(session: Session) -> list[Student]:
        student_01 = Student(name='Sayeed', roll=12, level='Ten', section='A1', created_at=None, created_by="SYS", updated_at=None, updated_by="SYS")
        student_02 = Student(name='Raihan', roll=15, level='Nine', section='A2', created_at=None, created_by="SYS", updated_at=None, updated_by="SYS")
        student_03 = Student(name='Sayem', roll=8, level='Six', section='B2', created_at=None, created_by="SYS", updated_at=None, updated_by="SYS")

        session.add(student_01)
        session.add(student_02)
        session.add(student_03)

        session.commit()

        session.refresh(student_01)
        session.refresh(student_02)
        session.refresh(student_03)
        return [student_01, student_02, student_03]

    @staticmethod
    def add_student(session: Session, student: Student, creator_username: str):
        student.created_by = creator_username
        student.updated_by = creator_username
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
    def select_student_by_id(session: Session, query_id: int):
        statement = select(Student).where(Student.id == query_id)
        students = session.exec(statement).all()
        return students

    @staticmethod
    def select_student_by_id_v2(session: Session, id: int):
        statement = select(Student).where(Student.id == id)
        students = session.exec(statement).all()
        return students

    @staticmethod
    def select_students_by_filter(session: Session, prop: str, value: str | int):
        if prop == "roll":
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
    def update_student_by_id(self, session: Session, student_data: Student, updater_username: str) -> StudentUpdateResponseParams:
        is_duplicate_student: bool = self.get_existing_student(session, student_data)
        response: StudentUpdateResponseParams = StudentUpdateResponseParams()
        if is_duplicate_student:
            response.response_message = (
                    "Could not update information."
                    + " There already exists a record for student with roll "
                    + str(student_data.roll)
                    + " in Class " + student_data.level
                    + " (section " + student_data.section + ")."
                    + " Please check the information again."
            )
        else:
            student_id = student_data.id
            statement = select(Student).where(Student.id == student_id)
            student = session.exec(statement).first()
            updated_student_dict = student_data.model_dump(exclude_unset=True)
            for key, value in updated_student_dict.items():
                if key in ['id', 'roll', 'section'] and (
                        value is None or value == "" or ("str" != (str(type(value))[8:11]) and value <= 0)):
                    continue
                else:
                    setattr(student, key, value)
            student.updated_by = updater_username
            session.add(student)
            session.commit()
            session.refresh(student)
            response.response_message = (
                    "Record for "
                    + student_data.name
                    + " Updated Successfully"
            )
            response.updated_student = student.model_dump_json()
        return response

    @check_existing_student
    def get_existing_student(self, session: Session, student_data: Student) -> Student:
        statement = (
            select(Student)
            .where(Student.roll == student_data.roll)
            .where(Student.level == student_data.level)
            .where(Student.section == student_data.section)
        )
        results = session.exec(statement)
        existing_students: list[Student] = [x for x in results.all()]
        return existing_students[0] if len(existing_students) and existing_students[0].id != student_data.id else None
    
    @staticmethod
    def select_students_by_class(session: Session) -> dict[str, int]:
        statement = select(Student.level, func.count(Student.id)).group_by(Student.level)
        results = session.exec(statement).all()
        return {level: count for level, count in results}
    
    @staticmethod
    def select_students_by_class_v2(session: Session) -> {str, int}:
        query = session.exec(Student.level, func.count(Student.id))
        statement = query.group_by(Student.level)
        results = statement.all()
        return results

    @staticmethod
    def update_student_user_id(session: Session, student_id: int, user_id: int, updater_username: str) -> Student:
        statement = select(Student).where(Student.id == student_id)
        student = session.exec(statement).first()
        if student:
            student.user_id = user_id
            student.updated_by = updater_username
            session.add(student)
            session.commit()
            session.refresh(student)
        return student

    @staticmethod
    def get_paginated_student_list(session: Session, filter: Optional[str], value: Optional[str | int], page: int, limit: int) -> StudentListResponse:
        if not (filter and value):
            filter = ""
            value = ""
        if filter in ["roll", "id"]:
            value = int(value)
        base_query = select(Student).where(Student.status == 'A')
        if value != '' and filter != '':
            base_query = base_query.where(getattr(Student, filter) == value)
        count_query = select(func.count()).select_from(base_query.subquery())
        total_count = session.exec(count_query).one()
        page_count = ceil(total_count / limit) if ceil(total_count / limit) > 0 else 1

        if page > page_count and total_count > 0:
            return StudentListResponse(
                page_count = page_count,
                students = [],
                message = f"Page {page} is out of range. The maximum page is {page_count}."
            )

        offset = (page - 1)*limit
        student_list_query = base_query.offset(offset).limit(limit)
        students = session.exec(student_list_query).all()
        return StudentListResponse(page_count = page_count, students = students)

student_service = StudentService()