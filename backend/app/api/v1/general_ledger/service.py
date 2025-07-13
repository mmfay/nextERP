from .schemas import MainAccount, CreateMainAccount

# In-memory store (can be replaced with DB later)
_main_accounts: list[MainAccount] = [
    MainAccount(account="1000", description="Cash", type="Asset"),
    MainAccount(account="2000", description="Accounts Payable", type="Liability"),
    MainAccount(account="3000", description="Retained Earnings", type="Equity"),
    MainAccount(account="4000", description="Sales Revenue", type="Revenue"),
    MainAccount(account="5000", description="Cost of Goods Sold", type="Expense"),
]
def get_trial_balance():
    return [
        {"account": 1001, "name": "Cash", "amount" : 10100},
        {"account": 2001, "name": "Accrued Purchase Orders", "amount" : 20100},
    ]

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
