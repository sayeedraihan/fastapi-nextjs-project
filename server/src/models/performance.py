from __future__ import annotations
from typing import List

from .base_model import BaseRequestResponse
from .db_models import Performance, Course


class GetCoursesAndPerformanceRequest(BaseRequestResponse):
    student_id: int = -1

class GetCoursesAndPerformanceResponse(BaseRequestResponse):
    courses: List["Course"]
    performances: List["Performance"]

class DeletePerformanceRequest(BaseRequestResponse):
    student_id: int = -1
    course_id: int = -1
