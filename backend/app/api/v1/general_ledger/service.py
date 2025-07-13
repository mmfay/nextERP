from .schemas import MainAccount, CreateMainAccount, FinancialDimension, UpdateFinancialDimension, DimensionValue

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

def get_trial_balance():
    return [
        {"account": 1001, "name": "Cash", "amount" : 10100},
        {"account": 2001, "name": "Accrued Purchase Orders", "amount" : 20100},
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