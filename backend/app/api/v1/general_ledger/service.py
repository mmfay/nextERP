from .schemas import *
from datetime import datetime, date
from uuid import uuid4
from typing import List, Optional, Dict, Any
from fastapi import HTTPException, status
from app.services.Tables import FinancialDimensionValues, FinancialDimensions, MainAccounts, GeneralJournalHeader, GeneralJournalLines
from app.classes import GeneralJournals
from app.data.general_ledger.in_memory_store import (
    _account_combinations,
    _gl_entries,
    _posting_setup,
)
from app.services.sequences import get_next_id, get_next_record
# -----------------------------
# Main Accounts
# -----------------------------
def get_main_accounts() -> list[MainAccount]:
    return MainAccounts.findAll()

def create_main_account(data: CreateMainAccount) -> MainAccount | None:
    return MainAccounts.create(data)

def delete_main_accounts_by_id(account_ids: list[str]) -> int:
    return MainAccounts.deleteAccounts(account_ids)

# -----------------------------
# Financial Dimensions
# -----------------------------
def get_financial_dimensions() -> list[FinancialDimension]:
    return FinancialDimensions.findAll()

def update_financial_dimension(data: UpdateFinancialDimension) -> FinancialDimension | None:
    return FinancialDimensions.update(data)

# -----------------------------
# Dimension Values
# -----------------------------
def get_financial_dimension_values(dimension_id: int) -> list[FinancialDimensionValue]:
    return FinancialDimensionValues.findByDimension(dimension_id)

def add_dimension_value(dimension_id: int, value: CreateFinancialDimensionValue) -> bool:
    return FinancialDimensionValues.create(dimension_id, value)

def delete_dimension_value(dimension_id: int, code: str) -> bool:
    return FinancialDimensionValues.delete(dimension_id, code)

# -----------------------------
# Account Combinations
# -----------------------------
def get_account_combinations() -> list[AccountCombination]:
    return [combo for combos in _account_combinations.values() for combo in combos]

def save_account_combinations(combos: list[AccountCombinationRequest]) -> None:
    global _account_combinations
    for combo in combos:
        acct = combo.account
        _account_combinations.setdefault(acct, []).append(
            AccountCombination(account=acct, dimensions=combo.dimensions)
        )

# -----------------------------
# Trial Balance
# -----------------------------
def get_trial_balance(
    from_date: date | None = None,
    to_date: date | None = None
) -> list[TrialBalanceEntry]:
    today = date.today()
    current_year_start = date(today.year, 1, 1)

    from_date = from_date or current_year_start
    to_date = to_date or today

    balances: dict[str, TrialBalanceEntry] = {}

    for entry in _gl_entries:
        if not (from_date <= entry.journal_date <= to_date):
            continue

        acct = entry.account_number
        name = entry.account_name
        debit = entry.debit
        credit = entry.credit

        if acct not in balances:
            balances[acct] = TrialBalanceEntry(
                account=acct,
                name=name,
                debit=0.0,
                credit=0.0,
                balance=0.0
            )

        balances[acct].debit += debit
        balances[acct].credit += credit
        balances[acct].balance += (debit - credit)

    return list(balances.values())

# -----------------------------
# General Journals
# -----------------------------
async def get_general_journals(*, limit: int, next_cursor: Optional[str], prev_cursor: Optional[str]) -> Dict[str, Any]:
    return await GeneralJournalHeader.get_page(limit=limit, next_cursor=next_cursor, prev_cursor=prev_cursor)

async def get_general_journal_by_id(journal_id: str) -> Optional[GeneralJournal]:
    return await GeneralJournalHeader.findByJournalID(journal_id)

async def validate_post_journal(journal_id: str) -> GeneralJournal:
    # validate and post journal
    return await GeneralJournalHeader.postJournal(journal_id)

async def create_general_journal(data: CreateGeneralJournal) -> GeneralJournal:
    return await GeneralJournalHeader.create(data)

# -----------------------------
# General Journals Lines
# -----------------------------
async def get_general_journal_lines(journal_id: str) -> list[JournalLineNew]:
    return await GeneralJournalLines.findByJournalID(journal_id)

def upsert_journal_lines(journal_id: str, incoming: List[JournalLine]) -> List[JournalLine]:
    return GeneralJournalLines.upsert(journal_id, incoming)

def delete_journal_line(journal_id: str, line_id: str) -> bool:
    return GeneralJournalLines.delete(journal_id, line_id)

# -----------------------------
# Posting Setup
# -----------------------------

def get_posting_setup():
    return _posting_setup

def update_posting_setup(updates: List[PostingSetup]) -> List[PostingSetup]:
    # Convert updates to a dictionary for faster lookup
    updates_by_type = {u.type: u for u in updates}

    # Loop through and replace only matched types
    for idx, existing in enumerate(_posting_setup):
        if existing.type in updates_by_type:
            _posting_setup[idx] = updates_by_type[existing.type]

    return _posting_setup
    