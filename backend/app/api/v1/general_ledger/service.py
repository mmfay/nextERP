from .schemas import *
from datetime import datetime, date
from uuid import uuid4
from typing import List, Optional, Dict
from fastapi import HTTPException, status
from app.services.Tables import FinancialDimensionValues, FinancialDimensions, MainAccounts, GeneralJournalHeader
from app.classes import GeneralJournals
from app.data.general_ledger.in_memory_store import (
    _main_accounts,
    _financial_dimensions,
    _financial_dimension_values,
    _account_combinations,
    _gl_entries,
    _general_journal_header,
    _journal_lines,
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
def get_general_journals() -> list[GeneralJournal]:
    return GeneralJournalHeader.findAll()

def get_general_journal_by_id(journal_id: str) -> Optional[GeneralJournal]:
    return GeneralJournalHeader.findByJournalID(journal_id)

def validate_post_journal(journal_id: str) -> GeneralJournal:
    # validate and post journal
    return GeneralJournalHeader.postJournal(journal_id)

# -----------------------------
# General Journals Lines
# -----------------------------
def get_general_journal_lines(journal_id: str) -> list[JournalLine]:
    return _journal_lines.get(journal_id, [])

def upsert_journal_lines(journal_id: str, incoming: List[JournalLine]) -> List[JournalLine]:
    """
    Replace the stored lines for `journal_id` with the diff of `incoming`:
     - update any matching lineID
     - insert any with no lineID (assign next integer)
     - delete any existing lines not present in incoming
    """
    print(incoming)
    # 1) grab existing lines
    existing = _journal_lines.get(journal_id, [])

    # 2) index existing by ID, but parse them as ints for ordering
    by_id: Dict[str, JournalLine] = {l.lineID: l for l in existing if l.lineID}
    existing_ids = [int(l.lineID) for l in existing if l.lineID.isdigit()]
    next_id = max(existing_ids, default=0) + 1

    # 3) build the new set
    updated_by_id: Dict[str, JournalLine] = {}
    for line in incoming:
        if line.lineID and line.lineID in by_id:
            # update in place
            stored = by_id[line.lineID]
            stored.account     = line.account
            stored.description = line.description
            stored.debit       = line.debit
            stored.credit      = line.credit
            updated_by_id[line.lineID] = stored
        else:
            # new line → assign next integer ID
            new_id = str(next_id)
            next_id += 1
            new_line = JournalLine(
                lineID=new_id,
                journalID=journal_id,
                account=line.account,
                description=line.description,
                debit=line.debit,
                credit=line.credit,
            )
            updated_by_id[new_id] = new_line
    # 4) replace the in‐memory store
    _journal_lines[journal_id] = list(updated_by_id.values())
    return _journal_lines[journal_id]


def delete_journal_line(journal_id: str, line_id: str) -> bool:
    
    lines = _journal_lines.get(journal_id, [])
    filtered = [l for l in lines if l.lineID != line_id]
    if len(filtered) < len(lines):
        _journal_lines[journal_id] = filtered
        return True
    return False

def create_general_journal(data: CreateGeneralJournal) -> GeneralJournal:
    """
    Create a new GeneralJournal, assign it a generated ID and initial status 'draft',
    append it to the in-memory header list, and return it.
    """
    # 1) generate a new sequential ID, e.g. "GJ-000001"
    new_id = get_sequence_gen_jour()

    # 2) build the model
    journal = GeneralJournal(
        journalID=new_id,
        document_date=data.document_date,
        type=data.type,
        description=data.description,
        status="draft",
    )

    # 3) persist to our in-memory list
    _general_journal_header.append(journal)

    # 4) return the newly created journal
    return journal

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

def get_sequence_gen_jour():
    return get_next_id("GJ")
    