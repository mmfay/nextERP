from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv()
from contextlib import asynccontextmanager

from app.api.v1.general_ledger.routes import router as gl_router
from app.api.v1.auth.routes import router as auth_router 
from app.api.v1.system_admin.routes import router as systemAdmin_router
from app.classes.DataBaseConnection import DB

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    DB.init_pool()  # uses DATABASE_URL / POSTGRES_DSN from env (or pass DSN here)
    try:
        yield
    finally:
        # Shutdown
        if DB._pool:
            DB._pool.close()  # psycopg3 pool closes connections
            DB._pool = None

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(gl_router, prefix="/api/v1/general_ledger", tags=["GeneralLedger"])
app.include_router(systemAdmin_router, prefix="/api/v1/system_admin", tags=["SystemAdmin"])
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Auth"])
