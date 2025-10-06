from __future__ import annotations

from sqlmodel import SQLModel
from typing import Optional

class CourseBase(SQLModel):
    name: str = None
    course_code: str = None
    description: Optional[str] = None
    credits: Optional[float] = None
