import os
from typing import Optional, Annotated

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlmodel import Session
from starlette.responses import JSONResponse

from src.app import get_session, sqlite_file_name
from src.service.student.student_service import StudentService
from src.models.db_models import Student
from src.models.student import StudentBase, StudentUpdateResponseParams, StudentDeleteParams
from src.models.user import User
from src.routes.base_routes import get_router
from src.utils.user_utils import get_current_active_user


router: APIRouter = get_router() # setup our APIRouter

student_service = StudentService()

@router.put("/add-demo-student")
def add_demo_student(*, session: Session = Depends(get_session)) -> list[Student]:
    if not os.path.exists(sqlite_file_name):
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail = "The DB is not available to be populated with")
    students: list = student_service.add_demo_students(session)
    return students

@router.post("/add-new-student")
def add_new_student(*, session: Session = Depends(get_session),
                    student_new: StudentBase, current_user: Annotated[User, Depends(get_current_active_user)]) -> Student:
    student = Student(**dict(student_new))
    student.id = 0
    setattr(session, 'student', student)
    student = student_service.add_student(session)
    return student

@router.get("/get-all-students")
def get_all_students(*, session: Session = Depends(get_session), current_user: Annotated[User, Depends(get_current_active_user)]):
    students: list[Student] = student_service.select_all_students(session)
    if not students:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail = "No students found")
    return students

@router.get("/get-student-by-id/{student_id}")
def get_student_by_id(*, session: Session = Depends(get_session),
                      student_id: str,
                      current_user: Annotated[User, Depends(get_current_active_user)]):
    query_id = int(student_id)
    setattr(session, 'id', query_id)
    students = student_service.select_student_by_id(session)
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
    update_response: StudentUpdateResponseParams = student_service.update_student_by_id(session, request)

    response: JSONResponse = JSONResponse(content=update_response.model_dump())
    return response

@router.delete("/delete-student-by-id")
def delete_students_by_id(*, session: Session = Depends(get_session),
                          delete_params: Optional[StudentDeleteParams] = None,
                          current_user: Annotated[User, Depends(get_current_active_user)]):
    setattr(session, "property", "id")
    setattr(session, "value", delete_params.id)
    students: list[Student] = student_service.delete_student_by_id(session)
    if not students:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail = "No student deleted")
    return students