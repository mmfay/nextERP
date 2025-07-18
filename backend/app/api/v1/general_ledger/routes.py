from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from datetime import date
from .service import *
from .schemas import *

router = APIRouter()

@router.get("/trial_balance", response_model=list[TrialBalanceEntry])
def trial_balance_route(
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None),
):
    return get_trial_balance(from_date, to_date)

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

@router.get("/financial_dimensions/{dimension_id}/values")
def api_get_values(dimension_id: int):
    return get_dimension_values(dimension_id)

@router.post("/financial_dimensions/{dimension_id}/values")
def api_add_value(dimension_id: int, value: DimensionValue):
    success = add_dimension_value(dimension_id, value)
    if not success:
        raise HTTPException(status_code=400, detail="Code already exists")
    return {"success": True}

@router.delete("/financial_dimensions/{dimension_id}/values/{code}")
def api_delete_value(dimension_id: int, code: str):
    success = delete_dimension_value(dimension_id, code)
    if not success:
        raise HTTPException(status_code=404, detail="Code not found")
    return {"success": True}

# -----------------------------
# Account Combinations
# -----------------------------
@router.get("/account_combinations", response_model=list[AccountCombination])
def get_combinations():
    return get_account_combinations()

@router.post("/account_combinations")
def save_combinations(data: list[AccountCombinationRequest]):
    save_account_combinations(data)
    return {"success": True, "count": len(data)}

# -----------------------------
# General Journals
# -----------------------------
@router.get("/general_journals", response_model=list[GeneralJournal])
def general_journals():
    return get_general_journals()

# -----------------------------
# General Journal Line
# -----------------------------
@router.get("/general_journals/{journal_id}/lines", response_model=list[JournalLine])
def general_journal_lines(journal_id: str):
    lines = get_general_journal_lines(journal_id)
    if lines is None:
        raise HTTPException(status_code=404, detail="Journal not found or has no lines")
    return lines