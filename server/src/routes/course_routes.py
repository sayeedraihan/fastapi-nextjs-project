from typing import List, Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from src.models.db_models import Course, User
from src.db_init import get_session
from src.service.course_service import course_service
from src.utils.user_utils import role_checker
from src.utils.base_utils import Role

router = APIRouter()
admin_dependency = Depends(role_checker([Role.ADMIN]))

@router.post("/courses/", response_model=Course)
def create_course(*, session: Session = Depends(get_session), course: Course, current_user: Annotated[User, admin_dependency]):
    return course_service.add_course(session, course, current_user.username)

@router.get("/courses/", response_model=List[Course])
def read_courses(*, session: Session = Depends(get_session), current_user: Annotated[User, admin_dependency]):
    return course_service.select_all_courses(session)

@router.get("/courses/{course_id}", response_model=Course)
def read_course(*, session: Session = Depends(get_session), course_id: int, current_user: Annotated[User, admin_dependency]):
    return course_service.select_course_by_id(session, course_id)

@router.put("/courses/{course_id}", response_model=Course)
def update_course(*, session: Session = Depends(get_session), course_id: int, course: Course, current_user: Annotated[User, admin_dependency]):
    return course_service.update_course(session, course_id, course, current_user.username)

@router.put("/courses/{course_id}", response_model=bool)
def delete_course(*, session: Session = Depends(get_session), course_id: int, current_user: Annotated[User, admin_dependency]):
    return course_service.delete_course(session, course_id, current_user.username)

