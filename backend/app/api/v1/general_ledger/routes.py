from fastapi import APIRouter, HTTPException
from .service import *
from .schemas import *

router = APIRouter()

@router.get("/trial_balance")
def trial_balance() -> list[Account]:
    return get_trial_balance()

@router.get("/main_accounts")
def main_accounts() -> list[MainAccount]:
    return get_main_accounts()

@router.post("/main_accounts", response_model=MainAccount)
def add_main_account(account: CreateMainAccount):
    created = create_main_account(account)
    if created is None:
        raise HTTPException(status_code=400, detail="Account already exists.")
    return created