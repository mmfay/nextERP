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

@router.delete("/main_accounts")
def delete_main_accounts(accounts: list[str]):
    deleted = delete_main_accounts_by_id(accounts)
    if deleted == 0:
        raise HTTPException(status_code=404, detail="No accounts deleted")
    return {"deleted": deleted}

@router.get("/financial_dimensions", response_model=list[FinancialDimension])
def get_dimensions():
    return get_financial_dimensions()

@router.put("/financial_dimensions", response_model=FinancialDimension)
def update_dimension(data: UpdateFinancialDimension):
    updated = update_financial_dimension(data)
    if not updated:
        raise HTTPException(status_code=404, detail="Dimension not found")
    return updated