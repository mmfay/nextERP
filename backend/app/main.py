# app/main.py
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv()
from contextlib import asynccontextmanager

# Route Paths
from app.api.v1.general_ledger.routes import router as gl_router
from app.api.v1.auth.routes import router as auth_router 
from app.api.v1.system_admin.routes import router as systemAdmin_router
from app.api.v1.shared.session.session import PgSessionStore
from app.api.v1.shared.session.inject import inject_session   # <-- add this
from app.classes.DataBaseConnection import DB

import os

@asynccontextmanager
async def lifespan(app: FastAPI):

    # initializes connection pool for database
    await DB.init_pool() 

    # catch if there is an error with init_pool() 
    if DB._pool is None:
        raise RuntimeError("DB pool not initialized (DB._pool is None). Check your DATABASE_URL/POSTGRES_DSN.")

    # add a global session store
    app.state.session_store = PgSessionStore(DB._pool)

    # give control back to fastAPI and close connection pool on app close
    try:
        yield
    finally:
        await DB.close_pool()

# allows FastAPI to know how to startup/shut down app for session
app = FastAPI(lifespan=lifespan)

# get frontend url variable
FRONTEND_URL = os.getenv("FRONTEND_URL")
if not FRONTEND_URL:
    raise RuntimeError("FRONTEND_URL is not set in environment")

# Middleware to allow backend to receive request from same front end
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],  # add more origins if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes with Dependency on companyID
app.include_router(gl_router, prefix="/api/v1/general_ledger", tags=["GeneralLedger"], dependencies=[Depends(inject_session)])
app.include_router(systemAdmin_router, prefix="/api/v1/system_admin", tags=["SystemAdmin"], dependencies=[Depends(inject_session)])
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Auth"])
