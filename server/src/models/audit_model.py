from sqlmodel import SQLModel, Field, text
from typing import Optional
from datetime import datetime

class AuditModel(SQLModel):
    created_at: Optional[datetime] = Field(
        # This field will not be set from the client side so server will not throw error if this is None
        default = None, 
        # If the field is none then the field will be ommitted during INSERT statement if None
        sa_column_kwargs = { "server_default": text("CURRENT_TIMESTAMP") }
    )
    created_by: Optional[str] = Field(default=None)
    updated_at: Optional[datetime] = Field(
        default=None, 
        sa_column_kwargs = { "server_default": text("CURRENT_TIMESTAMP") }
    )
    updated_by: Optional[str] = Field(default=None)
    status: Optional[str] = Field(default="A")

