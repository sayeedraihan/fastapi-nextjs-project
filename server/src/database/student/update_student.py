from sqlmodel import Session, select
from starlette.requests import Request

from src.models.db_models import Student
from src.models.student import StudentUpdateResponseParams
from src.utils.student_utils import check_existing_student, populate_empty_fields

@populate_empty_fields
def update_student_by_id(session: Session, request: Request) -> StudentUpdateResponseParams:
    is_duplicate_student: bool = get_existing_student(session, request)
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
def get_existing_student(session: Session, request: Request) -> Student:
    updated_student: dict = request.session["updated_student"]
    statement = (select(Student)
                 .where(Student.roll == updated_student["roll"])
                 .where(Student.level == updated_student["level"])
                 .where(Student.section == updated_student["section"])
    )
    results = session.exec(statement)
    existing_students: list[Student] = [x for x in results.all()]
    return existing_students[0] if len(existing_students) and existing_students[0].id != updated_student["id"] else None