from app.classes.DataBaseConnection import DB
from app.classes.Error import Error
from app.services.Tables.GeneralJournalTrans import GeneralJournalTrans
from app.services.Tables.GeneralJournalTable import GeneralJournalTable
from app.classes.Response import ValidationResponse
from datetime import datetime, date

class GeneralJournals:

    @staticmethod
    async def validate(journal_id: str) -> ValidationResponse: 
        """
        Validate Journal
        - Validates Journal, making sure records are balanced
        """ 
        
        # get the journal lines
        lines = await GeneralJournalTrans.findByJournalID(journal_id)

        # safety to prevent posting of blank journals
        if not lines:
            return ValidationResponse(valid=False, message=f"Cannot post Empty Journal: {journal_id} has no lines")
            
        # sum credits and debits
        total_debits = sum(line.debit for line in lines if not line.offsetAccount)
        total_credits = sum(line.credit for line in lines if not line.offsetAccount)

        # reject if not balanced
        if total_debits != total_credits:
            return ValidationResponse(valid=False, message=(f"Cannot post unbalanced journal {journal_id}: debits={total_debits} ≠ credits={total_credits}"))

        # return true when okay
        return ValidationResponse(valid=True, message=f"Journal {journal_id} is balanced.")
    
    @staticmethod
    async def post(journal_id: str, version_id: int) -> ValidationResponse: 
        """
        Post Journal
        - Validates Journal and checks if version is still accurate
        """  

        response = await GeneralJournals.validate(journal_id)

        # check if valid
        if not response.valid:
            return response
        
        # if valid, post journal and send validation response.
        record = await GeneralJournalTable.findByJournalID(journal_id)

        #
        record.posted = date.today()
        record.document_date = date.today()
        record.status = 'posted'

        async with DB.transaction():
            await GeneralJournalTable.recordLock(journal_id)
            await GeneralJournalTable.update(record, version_id)

        return ValidationResponse(valid=True, message="Journal Posted", record=record)