from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime, timezone

class AuditModel(SQLModel):
    created_at: Optional[datetime] = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    created_by: Optional[str] = Field(default="N/A")
    updated_at: Optional[datetime] = Field(default=None)
    updated_by: Optional[str] = Field(default="N/A")
    deleted_at: Optional[datetime] = Field(default=None)
    deleted_by: Optional[str] = Field(default="N/A")
    status: Optional[str] = Field(default="A")
