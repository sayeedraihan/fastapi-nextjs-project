from typing import Dict, Optional

from pydantic import BaseModel

from src.models.db_models import Student


class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

class LoginResponse(BaseModel):
    token: Token
    levels: list[Dict[str, str]]
    mediums: list[Dict[str, str]]
    fields: list[Dict[str, str]]
    role: str | None = None

