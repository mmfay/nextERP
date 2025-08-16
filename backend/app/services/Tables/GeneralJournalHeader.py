from app.classes.DataBaseConnection import DB
from typing import Optional, Dict, Any, List
from app.api.v1.general_ledger.schemas import (
    GeneralJournal,
    CreateGeneralJournal
)
from app.classes.GeneralJournals import GeneralJournals
from app.classes.Error import Error
from app.services.cursor import encode_cursor, decode_cursor
from app.services.sequences import get_next_id, get_next_record
class GeneralJournalHeader:

    @staticmethod
    def get_page(*, limit: int = 50, next_cursor: Optional[str] = None, prev_cursor: Optional[str] = None) -> Dict[str, Any]:
        # decode cursor (we only support forward/next right now)
        cur = decode_cursor(next_cursor)
        after_date: Optional[date] = cur.get("after_date")

        where_clause = ""
        params: List[Any] = []

        if after_date:
            where_clause = "WHERE document_date < %s"
            params.append(after_date)

        sql = f"""
            SELECT
                journal_id AS "journalID",
                document_date,
                type,
                description,
                status
            FROM GENERALJOURNALHEADER
            {where_clause}
            ORDER BY document_date DESC
            LIMIT %s;
        """
        params.append(limit + 1)  # +1 to detect has_next

        rows = DB.fetch_all(sql, tuple(params))
        has_next = len(rows) > limit
        rows = rows[:limit]

        items = [GeneralJournal(**row) for row in rows]

        next_tok = None
        if has_next and rows:
            last = rows[-1]
            next_tok = encode_cursor({"after_date": last["document_date"]})

        return {
            "items": items,
            "has_next": has_next,
            "next_cursor": next_tok,
            # defaults to satisfy Page[T]
            "has_prev": False,
            "prev_cursor": None,
            "limit": limit,
        }

    
    @staticmethod
    def findByJournalID(journal_id: str) -> Optional[GeneralJournal]:
        """
        Fetch a single General Journal header by its journal_id.
        Queries the database instead of in-memory store.
        """
        sql = """
            SELECT
                journal_id   AS "journalID",
                document_date,
                type,
                description,
                status
            FROM GENERALJOURNALHEADER
            WHERE journal_id = %s;
        """
        row = DB.fetch_one(sql, (journal_id,))

        if not row:
            return None

        return GeneralJournal(**row)
    
    @staticmethod
    def postJournal(journal_id: str) -> GeneralJournal:
        """
        Validate and post a General Journal by updating its status in the DB.
        Returns the updated journal row as a GeneralJournal model.
        """

        # 1) Ensure the journal exists (and load current values)
        journal = GeneralJournalHeader.findByJournalID(journal_id)
        if journal is None:
            Error.not_found("Journal not found", journal_id)

        # 2) Validate (your domain validation)
        GeneralJournals.validate(journal_id)

        # 3) Update status in DB and return updated row
        sql = """
            UPDATE GENERALJOURNALHEADER
               SET status = %s
             WHERE journal_id = %s
            RETURNING
                journal_id   AS "journalID",
                document_date,
                type,
                description,
                status;
        """
        row = DB.fetch_one(sql, ("posted", journal_id))

        if not row:
            # No row returned/updated — defensive guard
            Error.not_found("Journal not found or could not be updated", journal_id)

        return GeneralJournal(**row)
    
    @staticmethod
    def create(data: CreateGeneralJournal) -> GeneralJournal:
        """
        Insert a new General Journal header into the database and return it.

        Steps:
        - Generate a new sequential Journal ID (e.g., "GJ-000001").
        - Insert into GENERALJOURNALHEADER with initial status 'draft'.
        - RETURNING to fetch the inserted row.
        - Build and return a GeneralJournal Pydantic model.
        """
        new_id = get_next_id("GJ")

        sql = """
            INSERT INTO GENERALJOURNALHEADER (
                journal_id,
                document_date,
                type,
                description,
                status
            )
            VALUES (%s, %s, %s, %s, %s)
            RETURNING
                journal_id       AS "journalID",
                document_date,
                type,
                description,
                status;
        """

        params = (
            new_id,
            data.document_date,   # date
            data.type,            # str
            data.description,     # str
            "draft",              # initial status
        )

        # Assuming DB has fetch_one similar to fetch_all
        row = DB.fetch_one(sql, params)

        # If your DB wrapper doesn't have fetch_one, you can do:
        # rows = DB.fetch_all(sql, params)
        # row = rows[0] if rows else None

        if not row:
            # You can raise a domain error or return an Error model if you prefer
            raise RuntimeError("Failed to insert General Journal header.")

        return GeneralJournal(**row)