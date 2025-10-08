import os

from fastapi import HTTPException, status, APIRouter
from sqlmodel import SQLModel

from src.app import sqlite_file_name, engine
from src.routes.base_routes import get_router

router: APIRouter = get_router()

@router.get("/create-db")
def create_db():
    if(os.path.exists(sqlite_file_name)):
        raise HTTPException(status_code = status.HTTP_409_CONFLICT, detail = "The DB already exists")
    SQLModel.metadata.create_all(engine)
    raise HTTPException(status_code = status.HTTP_200_OK, detail = "The DB is created")

@router.post("/reset-db")
def reset_db():
    if(not os.path.exists(sqlite_file_name)):
        SQLModel.metadata.create_all(engine)
        raise HTTPException(status_code = status.HTTP_201_CREATED, detail = "The DB is created")
    elif(os.path.exists(sqlite_file_name)):
        engine.dispose()
        os.remove(sqlite_file_name)
        SQLModel.metadata.create_all(engine)
        raise HTTPException(status_code = status.HTTP_202_ACCEPTED, detail = "The DB reset done successfully")

@router.delete("/drop-db")
def drop_db():
    if(os.path.exists(sqlite_file_name)):
        engine.dispose() # closes all the connections to the engine pool
        os.remove(sqlite_file_name)
        raise HTTPException(status_code = status.HTTP_202_ACCEPTED, detail = "The db is deleted")
    raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail = "The DB does not exist or has already been deleted")
