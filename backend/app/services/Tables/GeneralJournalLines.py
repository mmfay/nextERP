from app.classes.DataBaseConnection import DB
from typing import List
from app.data.general_ledger.in_memory_store import (
    _journal_lines
)
from app.api.v1.general_ledger.schemas import (
    JournalLineNew, JournalLine
)
from app.classes.GeneralJournals import GeneralJournals
from app.classes.Error import Error
from app.services.sequences import get_next_id, get_next_record
class GeneralJournalLines:
    
    @staticmethod
    async def findByJournalID(journal_id: str) -> List[JournalLineNew]:
        print(journal_id)
        """
        Return all journal lines for the given journal ID from the database.
        If no lines exist, returns an empty list.

        Notes:
        - Uses asyncpg-style placeholders ($1).
        - Aliases columns to match the JournalLine schema field names.
        - Orders by line_id ascending to keep line order stable.
        """
        sql = """
            SELECT
                journal_id    AS "journalID",
                line_id       AS "lineID",
                account,
                description,
                debit,
                credit,
                company_id      AS "companyID",
                record_id       AS "recordID"
            FROM GENERALJOURNALLINES
            WHERE journal_id = $1
            ORDER BY line_id ASC;
        """
        rows = await DB.fetch_all(sql, (journal_id,))

        return [JournalLineNew(**dict(r)) for r in rows]

    @staticmethod
    def upsert(journal_id: str, incoming: List[JournalLine]) -> List[JournalLine]:
        """
        Insert or update journal lines for the given journal ID.

        Behavior:
        - If an incoming line has an existing `lineID`, update the stored line with matching ID.
        - If an incoming line has no `lineID`, assign the next sequential ID and insert it.
        - Any stored lines not present in `incoming` are deleted.
        
        Returns:
            The updated list of journal lines for the journal.
        """
        existing = _journal_lines.get(journal_id, [])

        # Index existing lines by ID
        by_id: Dict[str, JournalLine] = {l.lineID: l for l in existing if l.lineID}
        existing_ids = [int(l.lineID) for l in existing if l.lineID.isdigit()]
        next_id = max(existing_ids, default=0) + 1

        updated_by_id: Dict[str, JournalLine] = {}
        for line in incoming:
            if line.lineID and line.lineID in by_id:
                # Update in place
                stored = by_id[line.lineID]
                stored.account = line.account
                stored.description = line.description
                stored.debit = line.debit
                stored.credit = line.credit
                updated_by_id[line.lineID] = stored
            else:
                # Assign new ID for new line
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

        _journal_lines[journal_id] = list(updated_by_id.values())
        return _journal_lines[journal_id]
    
    @staticmethod
    def delete(journal_id: str, line_id: str) -> bool:
        """
        Delete a single journal line from the given journal ID.

        Returns:
            True if a line was deleted, False if no matching line was found.
        """
        lines = _journal_lines.get(journal_id, [])
        filtered = [l for l in lines if l.lineID != line_id]
        if len(filtered) < len(lines):
            _journal_lines[journal_id] = filtered
            return True
        return False