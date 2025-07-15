from .schemas import (
    MainAccount, 
    CreateMainAccount, 
    FinancialDimension, 
    UpdateFinancialDimension, 
    DimensionValue,
    AccountCombination,
    AccountCombinationRequest,
    GLEntry,
    TrialBalanceEntry
)
from datetime import datetime
from uuid import uuid4

# In-memory store (can be replaced with DB later)
_main_accounts: list[MainAccount] = [
    MainAccount(account="1000", description="Cash", type="Asset"),
    MainAccount(account="2000", description="Accounts Payable", type="Liability"),
    MainAccount(account="3000", description="Retained Earnings", type="Equity"),
    MainAccount(account="4000", description="Sales Revenue", type="Revenue"),
    MainAccount(account="5000", description="Cost of Goods Sold", type="Expense"),
]

_financial_dimensions: list[FinancialDimension] = [
    FinancialDimension(id=1, name="Department", in_use=True),
    FinancialDimension(id=2, name="Cost Center", in_use=True),
    FinancialDimension(id=3, name="", in_use=False),
    FinancialDimension(id=4, name="Project", in_use=True),
    FinancialDimension(id=5, name="", in_use=False),
    FinancialDimension(id=6, name="", in_use=False),
    FinancialDimension(id=7, name="", in_use=False),
    FinancialDimension(id=8, name="Region", in_use=True),
]

_dimension_values: dict[int, list[DimensionValue]] = {
    1: [DimensionValue(code="01", description="Marketing"), DimensionValue(code="02", description="Finance")],
    2: [DimensionValue(code="100", description="West Coast"), DimensionValue(code="200", description="East Coast")],
    8: [DimensionValue(code="01", description="Northwest"), DimensionValue(code="02", description="Southwest")],
}

_account_combinations: dict[str, list[AccountCombination]] = {
    "4000": [
        AccountCombination(account="4000", dimensions={
            "FD_1": "01",
            "FD_2": "100",
            "FD_3": None,
            "FD_4": None,
            "FD_5": None,
            "FD_6": None,
            "FD_7": None,
            "FD_8": "01",
        })
    ],
    "5000": [
        AccountCombination(account="5000", dimensions={
            "FD_1": "02",
            "FD_2": "200",
            "FD_3": None,
            "FD_4": None,
            "FD_5": None,
            "FD_6": None,
            "FD_7": None,
            "FD_8": "02",
        })
    ]
}

from uuid import uuid4
from datetime import datetime, date

_gl_entries: list[GLEntry] = [
    GLEntry(
        id=uuid4(),
        journal_date=date(2025, 7, 14),
        account_number="1000",
        account_name="Cash",
        debit=10000.00,
        credit=0.00,
        currency="USD",
        financial_dimensions={
            "FD_1": "01", "FD_2": "100", "FD_8": "01"
        },
        reference="AR-001",
        description="Customer payment received",
        source="Accounts Receivable",
        created_at=datetime.utcnow(),
        posted_by="admin"
    ),
    GLEntry(
        id=uuid4(),
        journal_date=date(2025, 7, 14),
        account_number="4000",
        account_name="Sales Revenue",
        debit=0.00,
        credit=10000.00,
        currency="USD",
        financial_dimensions={
            "FD_1": "01", "FD_2": "100", "FD_8": "01"
        },
        reference="AR-001",
        description="Revenue from sale",
        source="Accounts Receivable",
        created_at=datetime.utcnow(),
        posted_by="admin"
    )
]


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
def get_trial_balance() -> list[TrialBalanceEntry]:
    balances: dict[str, TrialBalanceEntry] = {}

    for entry in _gl_entries:
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

