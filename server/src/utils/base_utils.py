from enum import Enum, unique
from typing import Union

from sqlmodel import SQLModel
from starlette.responses import JSONResponse


def create_json_response(objects: Union[SQLModel, list[SQLModel]]):
    if isinstance(objects, list):
        object_json_list: list[str] = []
        for obj in objects:
            object_json_list.append(obj.model_dump_json())
        objects_dict: dict = {"results": object_json_list}
        return JSONResponse(content = objects_dict)
    else:
        return JSONResponse(content = objects.model_dump_json())

@unique
class Field(Enum):
    ID      = 'id'
    Name    = 'name'
    Class   = 'level'
    Section = 'section'
    Medium  = 'medium'

class Role(Enum):
    ADMIN   = "A"
    STUDENT = "S"

