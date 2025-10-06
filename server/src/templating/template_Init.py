from fastapi import Request, APIRouter
from fastapi.templating import Jinja2Templates

from src.routes.base_routes import get_router

router: APIRouter = get_router()

templates = Jinja2Templates(directory="templates")

@router.get("/template")
async def template(request: Request):
    return templates.TemplateResponse("home.html", {"request": request, "name": "code and code and code"})