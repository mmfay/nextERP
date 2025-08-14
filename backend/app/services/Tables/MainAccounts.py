from typing import Optional
from app.data.general_ledger.in_memory_store import (
    _main_accounts
)
from app.api.v1.general_ledger.schemas import (
    MainAccount,
    CreateMainAccount
)
from app.services.sequences import get_next_id, get_next_record
class MainAccounts:

    @staticmethod
    def findAll() -> list[MainAccount]:
        """
        Finds and returns all main accounts
        """
        return _main_accounts
    
    @staticmethod
    def create(data: CreateMainAccount) -> MainAccount | None:
        """
        Create a new Main Account.
        Returns True if created, False if a duplicate code exists in that dimension.
        """
        account = data.account.strip()

        if any(a.account == account for a in _main_accounts):
            return None
        new_entry = MainAccount(
            account         = data.account, 
            description     = data.description, 
            type            = data.type,
            record          = get_next_record("MA")
        )
        
        _main_accounts.append(new_entry)
        return new_entry