from fastapi import APIRouter, HTTPException, Query, status
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
@router.post(
    "/general_journals",
    response_model=GeneralJournal,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new general journal",
)
def create_journal(payload: CreateGeneralJournal):
    """
    Create a new GeneralJournal with a generated ID and initial status 'draft'.
    """
    return create_general_journal(payload)
@router.get("/general_journals", response_model=list[GeneralJournal])
def general_journals():
    return get_general_journals()

@router.get("/general_journals/{journal_id}", response_model=GeneralJournal)
def get_general_journal(journal_id: str):
    journal = get_general_journal_by_id(journal_id)
    if journal is None:
        raise HTTPException(status_code=404, detail="Journal not found")
    return journal

@router.patch("/general_journals/{journal_id}", response_model=GeneralJournal)
def post_journal(journal_id: str):
    journal = get_general_journal_by_id(journal_id)
    if journal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Journal {journal_id} not found"
        )
    return validate_post_journal(journal_id)

# -----------------------------
# General Journal Line
# -----------------------------
@router.get("/general_journals/{journal_id}/lines", response_model=list[JournalLine])
def general_journal_lines(journal_id: str):
    lines = get_general_journal_lines(journal_id)
    if lines is None:
        raise HTTPException(status_code=404, detail="Journal not found or has no lines")
    return lines

@router.put("/general_journals/{journal_id}/lines", response_model=List[JournalLine])
def update_lines(journal_id: str, lines: List[JournalLine]):
    # You may wish to validate journal existence first
    return upsert_journal_lines(journal_id, lines)

@router.delete("/general_journals/{journal_id}/lines/{line_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_line(journal_id: str, line_id: str):
    deleted = delete_journal_line(journal_id, line_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Line not found")
    return

# -----------------------------
# General Ledger Posting Setup
# -----------------------------
@router.get("/posting_setup", response_model=list[PostingSetup])
def posting_setup():
    return get_posting_setup()
