import json
from typing import Any

from sqlmodel import SQLModel, Field

class UserBase(SQLModel):
    username: str = Field(unique=True, index=True)
    email: str | None = None
    full_name: str | None = None
    disabled: bool | None = False
    password: str = None
    role: str = None
