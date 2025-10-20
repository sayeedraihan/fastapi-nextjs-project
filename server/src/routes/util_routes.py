from typing import List, Dict
from fastapi import APIRouter
from src.routes.base_routes import get_router
from src.utils.base_utils import Level, Medium, Field

router: APIRouter = get_router()

@router.get("/get-utils")
def get_levels() -> list[list[Dict[str, str]]]:
    """
    Returns a list of all available class levels, mediums and fields.
    """
    return [
        [{field.name: field.value} for field in Field],
        [{level.name: level.value} for level in Level],
        [{medium.name: medium.value} for medium in Medium],
    ]

