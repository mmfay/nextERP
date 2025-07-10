from fastapi import FastAPI
from app.api.v1.general_ledger.routes import router as gl_router

app = FastAPI()

app.include_router(gl_router, prefix="/api/v1/general_ledger", tags=["GeneralLedger"])
