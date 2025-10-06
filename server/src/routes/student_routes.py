import os
from typing import Optional, Annotated

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlmodel import Session
from starlette.responses import JSONResponse

from src.database.db import get_session, sqlite_file_name
from src.database.student.delete_student import delete_student_by_id
from src.database.student.insert_student import add_demo_students, add_student
from src.database.student.read_student import select_all_students, select_student_by_id, \
    select_students_by_filter
from src.database.student.update_student import update_student_by_id
from src.models.db_models import Student
from src.models.student import StudentBase, StudentUpdateResponseParams, StudentDeleteParams, StudentFilterParams
from src.models.user import User
from src.routes.base_routes import get_router
from src.utils.user_utils import get_current_active_user


router: APIRouter = get_router() # setup our APIRouter

@router.put("/add-demo-student")
def add_demo_student(*, session: Session = Depends(get_session)) -> list[Student]:
    if not os.path.exists(sqlite_file_name):
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail = "The DB is not available to be populated with")
    students: list = add_demo_students(session)
    return students
    # raise HTTPException(status_code = status.HTTP_202_ACCEPTED, detail = f"Name: {students[0].name}, ID: {students[0].id}")

@router.post("/add-new-student")
def add_new_student(*, session: Session = Depends(get_session),
                    student_new: StudentBase, current_user: Annotated[User, Depends(get_current_active_user)]) -> Student:
    student = Student(**dict(student_new))
    student.id = 0
    setattr(session, 'student', student)
    student = add_student(session)
    return student
    # raise HTTPException(status_code = status.HTTP_201_CREATED, detail = f"{student}")

@router.get("/get-all-students")
def get_all_students(*, session: Session = Depends(get_session), current_user: Annotated[User, Depends(get_current_active_user)]):
    students: list[Student] = select_all_students(session)
    if not students:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail = "No students found")
    return students

@router.get("/get-student-by-id/{student_id}")
def get_student_by_id(*, session: Session = Depends(get_session),
                      student_id: str,
                      current_user: Annotated[User, Depends(get_current_active_user)]):
    query_id = int(student_id)
    setattr(session, 'id', query_id)
    students = select_student_by_id(session)
    if not students:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No Student found with this ID")
    return students

@router.post("/update-student-by-id")
def update_students_by_id(*, session: Session = Depends(get_session),
                          updated_student: Optional[Student] = None,
                          request: Request,
                          current_user: Annotated[User, Depends(get_current_active_user)]) -> JSONResponse:
    request.session["updated_student"] = dict(updated_student)
    request.session["id"] = updated_student.id
    update_response: StudentUpdateResponseParams = update_student_by_id(session, request)
    # if not update_response.is_updated:
        # update_response.updated_student = Student(request.session["updated_student"])

    response: JSONResponse = JSONResponse(content=update_response.model_dump())
    return response
    # raise HTTPException(status_code = status.HTTP_200_OK, detail = f"Updated Student List: {students}")

@router.delete("/delete-student-by-id")
def delete_students_by_id(*, session: Session = Depends(get_session),
                          delete_params: Optional[StudentDeleteParams] = None,
                          current_user: Annotated[User, Depends(get_current_active_user)]):
    setattr(session, "property", "id")
    setattr(session, "value", delete_params.id)
    students: list[Student] = delete_student_by_id(session)
    if not students:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail = "No student deleted")
    return students

@router.post("/get-students-by-filter")
def get_student_by_filter(*, session: Session = Depends(get_session),
                          filter_params: Optional[StudentFilterParams] = None,
                          current_user: Annotated[User, Depends(get_current_active_user)]) -> list[Student]:
    setattr(session, "property", filter_params.prop)
    setattr(session, "value", filter_params.val)
    students: list[Student] = select_students_by_filter(session)
    if not students:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail = "No student deleted")
    return students