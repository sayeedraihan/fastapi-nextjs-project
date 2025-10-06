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
class Level(Enum):
    ONE    = "One"
    TWO    = 'Two'
    THREE  = 'Three'
    FOUR   = 'Four'
    FIVE   = 'Five'
    SIX    = 'Six'
    SEVEN  = 'Seven'
    EIGHT  = 'Eight'
    NINE   = 'Nine'
    TEN    = 'Ten'
    ELEVEN = 'Eleven'
    TWELVE = 'Twelve'

@unique
class Medium(Enum):
    Bangla  = 'Ban'
    English = 'Eng'

@unique
class Field(Enum):
    ID      = 'id'
    Name    = 'name'
    Class   = 'level'
    Section = 'section'
    Medium  = 'medium'