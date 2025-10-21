
from pydantic import BaseModel
from sqlmodel import SQLModel
from typing import Dict, List, Optional

from src.models.token import Token
from src.models.db_models import Course, Performance, Student

class BaseRequestResponse(SQLModel):
    message: str = ""

class GetCoursesAndPerformanceRequest(BaseRequestResponse):
    student_id: int = -1

class GetCoursesAndPerformanceResponse(BaseRequestResponse):
    courses: List["Course"]
    performances: List["Performance"]

class DeletePerformanceRequest(BaseRequestResponse):
    student_id: int = -1
    course_id: int = -1

class DashboardRequestResponse(BaseRequestResponse):
    role: str

class AdminDashboardResponse(DashboardRequestResponse):
    students_per_class: Dict[str, int]
    students_per_course: Dict[str, int]

class StudentDashboardResponse(DashboardRequestResponse):
    student: Student
    performances: list[Performance]
    courses: List[Course]

class StudentDetailsParams(SQLModel):
    id: str = None

class StudentDeleteParams(SQLModel):
    id: str = None

class StudentUpdateResponseParams(SQLModel):
    is_updated: bool = False
    updated_student: str = None
    response_message: str = ""

class LoginResponse(BaseModel):
    token: Token
    student: Optional[Student] = None
    role: str

class AddUserRequest(BaseModel):
    username: str
    password: str
    student_id: int
    role: str
    full_name: Optional[str] = None

class GetUserByIdRequest(BaseModel):
    user_id: int

