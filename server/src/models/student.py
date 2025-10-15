from __future__ import annotations

from sqlmodel import SQLModel
from typing import Optional

class StudentBase(SQLModel):
    name: Optional[str] = None
    roll: Optional[int] = 0
    level: Optional[str] = None
    section: Optional[str] = None
    medium: Optional[str] = None