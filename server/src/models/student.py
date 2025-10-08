from __future__ import annotations

from sqlmodel import SQLModel
from typing import Optional

class StudentBase(SQLModel):
    name: Optional[str] = None
    roll: Optional[int] = 0
    level: Optional[str] = None
    section: Optional[str] = None
    medium: Optional[str] = None

class StudentDetailsParams:
    id: str = None


class StudentDeleteParams(SQLModel):
    id: str = None

class StudentUpdateResponseParams(SQLModel):
    is_updated: bool = False
    updated_student: str = None
    response_message: str = ""
