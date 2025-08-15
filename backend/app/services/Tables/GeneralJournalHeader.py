from typing import Optional
from app.data.general_ledger.in_memory_store import (
    _general_journal_header
)
from app.api.v1.general_ledger.schemas import (
    GeneralJournal
)
from app.classes.GeneralJournals import GeneralJournals
from app.classes.Error import Error
from app.services.sequences import get_next_id, get_next_record
class GeneralJournalHeader:

    @staticmethod
    def findAll() -> list[GeneralJournal]:
        return _general_journal_header
    
    @staticmethod
    def findByJournalID(journal_id: str) -> Optional[GeneralJournal]:
        for journal in _general_journal_header:
            if journal.journalID == journal_id:
                return journal
        return None
    
    @staticmethod
    def postJournal(journal_id: str) -> GeneralJournal:
        print(journal_id)
        journal = GeneralJournalHeader.findByJournalID(journal_id)

        if journal is None: 
            Error.not_found("Journal not found", journal_id)

        # validate posting
        GeneralJournals.validate(journal.journalID)

        journal.status = "posted"

        return journal