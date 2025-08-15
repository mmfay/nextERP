from app.classes.Error import Error
from app.services.Tables import GeneralJournalHeader
from app.data.general_ledger.in_memory_store import _journal_lines
class GeneralJournals:

    @staticmethod
    def validate(journal_id: str) -> None: 
        # 1) get journal lines
        lines = _journal_lines.get(journal_id)

        if not lines:
            Error.bad_request("Cannot post Empty Journal",
                              f"{journal_id} has no lines")
            
        # 2) sum debits & credits
        total_debits = sum(line.debit for line in lines)
        total_credits = sum(line.credit for line in lines)

        # 3) reject if unbalanced
        if total_debits != total_credits:
            Error.bad_request(f"Cannot post unbalanced journal {journal_id}: ", 
                                f"debits={total_debits} ≠ credits={total_credits}")

        # 4) return true if ok
        return None