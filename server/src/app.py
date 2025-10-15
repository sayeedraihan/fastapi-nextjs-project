import os

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from src.routes import dashboard_routes
from src.routes import student_routes, db_routes, authentication_routes, user_routes, performance_routes
from src.templating import template_Init
from src.db_init import initialize_database # gemini
from contextlib import asynccontextmanager # gemini


@asynccontextmanager # gemini
async def lifespan(app: FastAPI): # gemini
    # run on startup
    initialize_database() # gemini
    yield # gemini
    # run on shutdown


SESSION_SECRET_KEY = os.urandom(24).hex()  # secret key for session

app = FastAPI(lifespan=lifespan) # gemini

# --- CORS Middleware setting start ---
# Define the origins that are allowed to access your backend
# This should be the address of your Next.js development server.
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# --- CORS middleware setting end ---

app.include_router(db_routes.router)
app.include_router(student_routes.router)
app.include_router(authentication_routes.router)
app.include_router(user_routes.router)
app.include_router(template_Init.router)
app.include_router(performance_routes.router)
app.include_router(dashboard_routes.router)
app.add_middleware(SessionMiddleware, secret_key=SESSION_SECRET_KEY)

# === ADD THIS SECTION ===
# By calling this after all routes are included, we guarantee that every model
# has been imported and is known to Python before we ask SQLAlchemy to resolve
# the relationships between them.
# models.Student.model_rebuild()
# models.Course.model_rebuild()
# models.Performance.model_rebuild()
# === END SECTION ===

@app.get("/")
def home() -> dict:
    return {"Data": "Test"}

if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)

