from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.general_ledger.routes import router as gl_router
from app.api.v1.inventory.routes import router as inv_router
from app.api.v1.shared.addresses.routes import router as address_router 
from app.api.v1.auth.routes import router as auth_router 
from app.api.v1.system_admin.routes import router as systemAdmin_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(gl_router, prefix="/api/v1/general_ledger", tags=["GeneralLedger"])
app.include_router(inv_router, prefix="/api/v1/inventory", tags=["Inventory"])
app.include_router(address_router, prefix="/api/v1/shared/addresses", tags=["Shared"])
app.include_router(systemAdmin_router, prefix="/api/v1/system_admin", tags=["SystemAdmin"])
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Auth"])
