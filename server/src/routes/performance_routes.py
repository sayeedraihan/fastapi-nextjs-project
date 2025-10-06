from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from starlette import status

from src.database.course.read_course import select_all_courses
from src.database.db import get_session
from src.database.performance.delete_performance import delete_performance
from src.database.performance.insert_performance import add_performance
from src.database.performance.read_performance import select_performance_by_student_id
from src.models.db_models import Performance
from src.models.performance import GetCoursesAndPerformanceResponse, GetCoursesAndPerformanceRequest, \
    DeletePerformanceRequest
from src.models.user import User

from src.utils.user_utils import get_current_active_user

router = APIRouter()

@router.post("/get-courses-and-student-performance", response_model=GetCoursesAndPerformanceResponse)
def get_courses_and_performance(*, session: Session = Depends(get_session),
                                request: GetCoursesAndPerformanceRequest,
                                current_user: Annotated[User, Depends(get_current_active_user)]):
    courses = select_all_courses(session)
    performances = select_performance_by_student_id(session, request.student_id)
    if not courses:
        raise HTTPException(status_code=404, detail="No course found. Please add at least one course first.")
    return GetCoursesAndPerformanceResponse(courses = courses, performances = performances)

@router.post("/add-performance", response_model=Performance)
def add_new_performance(*, session: Session = Depends(get_session),
                    performance: Performance,
                    current_user: Annotated[User, Depends(get_current_active_user)]):
    return add_performance(session, performance)

@router.post("/update-performance", response_model=bool)
def update_performance(*, session: Session = Depends(get_session),
                       request: DeletePerformanceRequest,
                       current_user: Annotated[User, Depends(get_current_active_user)]):
    if delete_performance(session, request.student_id, request.course_id):
        return {"message": "Performance record deleted successfully"}
    else:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not delete performance record.")

@router.delete("/delete-performance")
def delete_performance_route(*, session: Session = Depends(get_session), request: DeletePerformanceRequest):
    if delete_performance(session, request.student_id, request.course_id):
        return {"message": "Performance record deleted successfully"}
    else:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not delete performance record")