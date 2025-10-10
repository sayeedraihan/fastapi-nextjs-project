from typing import Dict

from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None
    role: str | None = None

class LoginResponse(BaseModel):
    token: Token
    levels: list[Dict[str, str]]
    mediums: list[Dict[str, str]]
    fields: list[Dict[str, str]]
