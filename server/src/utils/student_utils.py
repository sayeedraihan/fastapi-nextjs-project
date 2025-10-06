from typing import Callable

import json

from src.models.db_models import Student
from src.models.student import StudentUpdateResponseParams


def populate_empty_fields(func: Callable) -> Callable:
    def wrapper(*args, **kwargs) -> StudentUpdateResponseParams:
        update_response: StudentUpdateResponseParams = func(*args, **kwargs)
        updated_student = json.loads(update_response.updated_student)
        if update_response.updated_student is None:
            return update_response
        if updated_student["name"] is None or updated_student["name"] == "":
            updated_student["name"] = "John Doe"
        if updated_student["level"] is None or updated_student["level"] == "":
            updated_student["level"] = "0"
        update_response.updated_student = json.dumps(updated_student)
        return update_response
    return wrapper

def check_existing_student(func: Callable) -> Callable:
    def wrapper(*args, **kwargs) -> bool:
        existing_student: Student = func(*args, **kwargs)
        return True if existing_student is not None else False
    return wrapper