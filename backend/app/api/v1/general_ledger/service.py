from .schemas import (
    MainAccount, 
    CreateMainAccount, 
    FinancialDimension, 
    UpdateFinancialDimension, 
    DimensionValue,
    AccountCombination,
    AccountCombinationRequest,
    GLEntry,
    TrialBalanceEntry,
    GeneralJournal,
    JournalLine
)
from datetime import datetime, date
from uuid import uuid4
from typing import List, Optional, Dict
from fastapi import HTTPException
from app.data.general_ledger.in_memory_store import (
    _main_accounts,
    _financial_dimensions,
    _dimension_values,
    _account_combinations,
    _gl_entries,
    _general_journal_header,
    _journal_lines
)

# -----------------------------
# Main Accounts
# -----------------------------
def get_main_accounts() -> list[MainAccount]:
    return _main_accounts

def create_main_account(data: CreateMainAccount) -> MainAccount | None:
    if any(account.account == data.account for account in _main_accounts):
        return None  # Account already exists
    new_account = MainAccount(**data.dict())
    _main_accounts.append(new_account)
    return new_account

def delete_main_accounts_by_id(account_ids: list[str]) -> int:
    global _main_accounts
    original_len = len(_main_accounts)
    _main_accounts = [acct for acct in _main_accounts if acct.account not in account_ids]
    return original_len - len(_main_accounts)

# -----------------------------
# Financial Dimensions
# -----------------------------
def get_financial_dimensions() -> list[FinancialDimension]:
    return _financial_dimensions

def update_financial_dimension(data: UpdateFinancialDimension) -> FinancialDimension | None:
    for i, dim in enumerate(_financial_dimensions):
        if dim.id == data.id:
            _financial_dimensions[i] = FinancialDimension(**data.dict())
            return _financial_dimensions[i]
    return None

# -----------------------------
# Dimension Values
# -----------------------------
def get_dimension_values(dimension_id: int) -> list[DimensionValue]:
    return _dimension_values.get(dimension_id, [])

def add_dimension_value(dimension_id: int, value: DimensionValue) -> bool:
    values = _dimension_values.setdefault(dimension_id, [])
    if any(v.code == value.code for v in values):
        return False  # duplicate code
    values.append(value)
    return True

def delete_dimension_value(dimension_id: int, code: str) -> bool:
    values = _dimension_values.get(dimension_id)
    if values is not None:
        updated = [v for v in values if v.code != code]
        _dimension_values[dimension_id] = updated
        return True
    return False

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
    return _general_journal_header

def get_general_journal_by_id(journal_id: str) -> Optional[GeneralJournal]:
    for journal in _general_journal_header:
        if journal.journalID == journal_id:
            return journal
    return None

def validate_post_journal(journal_id: str) -> GeneralJournal:
    # get journal lines
    lines = _journal_lines.get(journal_id)

    # 2) sum debits & credits
    total_debits = sum(line.debit for line in lines)
    total_credits = sum(line.credit for line in lines)

    # 3) reject if unbalanced
    if total_debits != total_credits:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Cannot post unbalanced journal {journal_id}: "
                f"debits={total_debits} ≠ credits={total_credits}"
            )
        )

    journal = get_general_journal_by_id(journal_id)
    journal.status = "posted"
    # 4) all good → construct & return your posted journal
    #    (you could also flip a status flag in a header store if you have one)
    return journal

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