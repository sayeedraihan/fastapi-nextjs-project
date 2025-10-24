from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime, timezone

class AuditModel(SQLModel):
    created_at: Optional[datetime] = Field(
        default = None, sa_column_kwargs = { "default": "CURRENT_TIMESTAMP" }
    )
    created_by: Optional[str] = Field(default=None)
    updated_at: Optional[datetime] = Field(default=None)
    updated_by: Optional[str] = Field(default=None)
    status: Optional[str] = Field(default="A")
