from typing import Annotated, Union
from fastapi import APIRouter, Depends, HTTPException
import json
from sqlmodel import Session
from starlette import status
from src.service.course_service import course_service
from src.service.performance_service import performance_service
from src.service.student_service import student_service
from src.models.db_models import User
from src.utils.base_utils import Role
from src.db_init import get_session
from src.models.request_response_models import AdminDashboardResponse, DashboardRequestResponse, StudentDashboardResponse

from src.service.dashboard_service import dashboard_service
from src.utils.user_utils import get_current_active_user

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_data(*,
    session: Session = Depends(get_session),
    current_user: Annotated[User, Depends(get_current_active_user)]
    ) -> Union[AdminDashboardResponse, StudentDashboardResponse, DashboardRequestResponse]:
    if current_user.role == "A":
        students_per_class = dashboard_service.get_students_per_class(session)
        students_per_course = dashboard_service.get_students_per_course(session)
        print("Student Per Class: " + json.dumps(students_per_class))
        return AdminDashboardResponse(
            students_per_class=students_per_class,
            students_per_course=students_per_course,
            role=Role.ADMIN
        )
    elif current_user.role == "S":
        student_details = student_service.get_student_details_by_user_id(session, current_user.id)
        courses = course_service.select_all_courses(session)
        performances = performance_service.select_performance_by_student_id(session, student_details.id)

        if not student_details:
            """ raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student details not found for the current user"
            ) """
            response = DashboardRequestResponse()
            response.message = "Student details not found for the current user."
            return response
        return StudentDashboardResponse(
            student=student_details,
            performances=performances,
            role=Role.STUDENT
        )
        print("Student")
    else:
        print("Error")
        response = DashboardRequestResponse()
        response.message = "You do not have permission to access this resource."
        return response