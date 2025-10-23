from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from starlette import status

from src.service.course_service import course_service
from src.db_init import get_session
from src.service.performance_service import performance_service
from src.models.db_models import Performance, User
from src.models.request_response_models import GetCoursesAndPerformanceResponse, GetCoursesAndPerformanceRequest, \
    DeletePerformanceRequest

from src.utils.user_utils import get_current_active_user

router = APIRouter()

@router.post("/get-courses-and-student-performance", response_model=GetCoursesAndPerformanceResponse)
def get_courses_and_performance(*, session: Session = Depends(get_session),
                                request: GetCoursesAndPerformanceRequest,
                                current_user: Annotated[User, Depends(get_current_active_user)]):
    courses = course_service.select_all_courses(session)
    performances = performance_service.select_performance_by_student_id(session, request.student_id)
    if not courses:
        raise HTTPException(status_code=404, detail="No course found. Please add at least one course first.")
    return GetCoursesAndPerformanceResponse(courses = courses, performances = performances)

@router.post("/add-performance", response_model=Performance)
def add_new_performance(*, session: Session = Depends(get_session),
                    performance: Performance,
                    current_user: Annotated[User, Depends(get_current_active_user)]):
    return performance_service.add_performance(session, performance, current_user.username)

@router.put("/update-performance", response_model=Performance)
def update_performance_route(*, session: Session = Depends(get_session),
                         performance: Performance,
                         current_user: Annotated[User, Depends(get_current_active_user)]):
    return performance_service.update_performance(session, performance, current_user.username)

@router.put("/delete-performance")
def delete_performance_route(*, session: Session = Depends(get_session), 
                             current_user: Annotated[User, Depends(get_current_active_user)], 
                             request: DeletePerformanceRequest):
    if performance_service.delete_performance(session, request.student_id, request.course_id, current_user.username):
        return {"message": "Performance record deleted successfully"}
    else:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not delete performance record")