from sqlmodel import SQLModel


class BaseRequestResponse(SQLModel):
    message: str = ""