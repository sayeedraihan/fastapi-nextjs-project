import os
from typing import Optional, Annotated

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlmodel import Session
from starlette.responses import JSONResponse

from src.utils.base_utils import Role
from src.env import sqlite_file_name
from src.models.student import StudentBase
from src.db_init import get_session
from src.service.student_service import student_service
from src.models.db_models import Student
from src.models.request_response_models import BaseRequestResponse, StudentListResponse, StudentUpdateResponseParams, StudentDeleteParams
from src.models.db_models import User
from src.routes.base_routes import get_router
from src.utils.user_utils import role_checker

router: APIRouter = get_router()
admin_dependency = Depends(role_checker([Role.ADMIN]))

@router.put("/add-demo-student")
def add_demo_student(*, session: Session = Depends(get_session)) -> list[Student]:
    if not os.path.exists(sqlite_file_name):
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail = "The DB is not available to be populated with")
    students: list = student_service.add_demo_students(session)
    return students

@router.post("/add-new-student")
def add_new_student(*, session: Session = Depends(get_session),
                    student_new: StudentBase, current_user: Annotated[User, admin_dependency]) -> Student:
    student = Student(**dict(student_new))
    student = student_service.add_student(session, student, current_user.username)
    return student

@router.get("/get-all-students")
def get_all_students(*, session: Session = Depends(get_session), 
                    current_user: Annotated[User, admin_dependency],
                    property: Optional[str] = "",
                    value: Optional[str | int] = "",
                    page: int = 1,
                    limit: int = 10):
    student_list_response: StudentListResponse = student_service.get_paginated_student_list(
        session, property, value, page, limit
    )

    if not student_list_response.students and not student_list_response.message:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail = "No students found")
    return student_list_response

@router.get("/get-student-by-id/{student_id}")
def get_student_by_id(*, session: Session = Depends(get_session),
                      student_id: str,
                      current_user: Annotated[User, admin_dependency]):
    students = student_service.select_student_by_id(session, int(student_id))
    if not students:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No Student found with this ID")
    return students

@router.put("/update-student-by-id")
def update_students_by_id(*, session: Session = Depends(get_session),
                          updated_student: Optional[Student] = None,
                          request: Request,
                          current_user: Annotated[User, admin_dependency]) -> JSONResponse:
    update_response: StudentUpdateResponseParams = student_service.update_student_by_id(session, updated_student, current_user.username)

    response: JSONResponse = JSONResponse(content=update_response.model_dump())
    return response

@router.put("/delete-student-by-id")
def delete_students_by_id(*, session: Session = Depends(get_session),
                          delete_params: Optional[StudentDeleteParams] = None,
                          current_user: Annotated[User, admin_dependency]):
    response: BaseRequestResponse = student_service.delete_student_by_id(session, "id", delete_params.id, current_user.username)
    if not response:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail = f"No student found with id = {delete_params.id}")
    return response

