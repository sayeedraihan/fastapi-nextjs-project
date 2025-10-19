from __future__ import annotations

from sqlmodel import SQLModel
from typing import Optional

from src.models.audit_model import AuditModel

class CourseBase(AuditModel):
    name: str = None
    course_code: str = None
    description: Optional[str] = None
    credits: Optional[float] = None
