from app.classes.DataBaseConnection import DB
from typing import Optional, Dict, Any, List
from app.api.v1.general_ledger.schemas import (
    GeneralJournal,
    CreateGeneralJournal
)
from app.classes.Error import Error
from app.services.cursor import encode_cursor, decode_cursor
from app.api.v1.shared.session.request_context import get_company_id, get_user_id

def _to_int(val) -> Optional[int]:
    if val is None:
        return None
    if isinstance(val, int):
        return val
    if isinstance(val, str):
        return int(val)
    # allow things like Decimal
    return int(val)

class GeneralJournalTable:

    @staticmethod
    async def get_page( *, limit: int = 50, next_cursor: Optional[str] = None, prev_cursor: Optional[str] = None) -> Dict[str, Any]:
        """
        Fetch General Journal Headers w/ pagination
        Limit is 50, will allow user to change that in there settings.
        """
        cur = decode_cursor(next_cursor)
        after_record: Optional[int] = _to_int(cur.get("after_rec"))

        params: List[Any] = []
        idx = 1
        where_clause = ""

        if after_record:
            where_clause = f"WHERE record_id < ${idx}"
            params.append(after_record)
            idx += 1

        limit_placeholder = f"${idx}"
        params.append(limit + 1)  # +1 to detect has_next

        sql = f"""
            SELECT
                journal_id    AS "journalID",
                document_date,
                type,
                description,
                status,
                posted,
                version_id      AS "versionID",
                company_id    AS "companyID",
                record_id     AS "recordID"
            FROM GENERALJOURNALTABLE
            {where_clause}
            ORDER BY record_id DESC
            LIMIT {limit_placeholder};
        """

        rows = await DB.fetch_all(sql, tuple(params))

        has_next = len(rows) > limit
        rows = rows[:limit]

        items = [GeneralJournal(**row) for row in rows]

        next_tok = None
        if has_next and rows:
            last_rec_id = rows[-1]["recordID"]  # aliased above
            next_tok = encode_cursor({"after_rec": int(last_rec_id)})

        return {
            "items": items,
            "has_next": has_next,
            "next_cursor": next_tok,
            "has_prev": False,
            "prev_cursor": None,
            "limit": limit,
        }

    
    @staticmethod
    async def findByJournalID(journal_id: str) -> Optional[GeneralJournal]:
        """
        Fetch a single General Journal header by its journal_id.
        Async version for asyncpg-style drivers.
        """
        sql = """
            SELECT
                journal_id   AS "journalID",
                document_date,
                type,
                description,
                status,
                posted, 
                version_id as "versionID",
                company_id as "companyID",
                record_id as "recordID"
            FROM GENERALJOURNALTABLE
            WHERE journal_id = $1;
        """
        row = await DB.fetch_one(sql, (journal_id,))
        if not row:
            return None
        return GeneralJournal(**row)
    
    @staticmethod
    async def create(data: CreateGeneralJournal) -> GeneralJournal:
        """
        Insert a new General Journal header and return it.
        Uses asyncpg-style $ placeholders.
        """

        sql = """
            INSERT INTO GENERALJOURNALTABLE (
                journal_id,
                document_date,
                type,
                description,
                status,
                company_id
            )
            VALUES ($1, $2, $3, $4, $5, 1)
            RETURNING
                journal_id    AS "journalID",
                document_date,
                type,
                description,
                status,
                posted,
                company_id    AS "companyID",
                record_id     AS "recordID";
        """
        params = (
            new_id,
            data.document_date,   # date
            data.type,            # str
            data.description,     # str
            "draft",              # initial status
        )

        row = await DB.fetch_one(sql, params)
        if not row:
            raise RuntimeError("Failed to insert General Journal header.")

        # asyncpg returns a Record; allow dict or Record
        if not isinstance(row, dict):
            row = dict(row)

        return GeneralJournal(**row)
    
    @staticmethod
    async def recordLock(journal_id: str):
        sql = f"""
            SELECT
                *
            FROM GENERALJOURNALTABLE
            WHERE journal_id = $1 AND company_id = $2
            FOR UPDATE;
        """
        
        row = await DB.fetch_one(sql, [journal_id, get_company_id()])

    @staticmethod
    async def update(record: GeneralJournal, versionID: int) -> GeneralJournal:

        sql=f"""
            UPDATE GENERALJOURNALTABLE
            SET 
                journal_id          = $1,
                document_date       = $2,
                type                = $3,
                description         = $4,
                status              = $5,
                posted              = $6,
                version_id          = $7,
                company_id          = $8
            WHERE 
                1=1
                AND record_ID = $9
                AND version_ID = $10
                AND company_ID = $11
            RETURNING 
                journal_id      AS "journalID"
                ,document_date
                ,type
                ,description
                ,status
                ,posted
                ,version_id     AS "versionID"
                ,company_id     AS "companyID"
                ,record_id      AS "recordID";
        """
        
        row = await DB.fetch_one(sql, [
                                    record.journalID
                                    ,record.document_date
                                    ,record.type
                                    ,record.description
                                    ,record.status
                                    ,record.posted
                                    ,record.versionID + 1
                                    ,record.companyID
                                    ,record.recordID
                                    ,record.versionID
                                    ,get_company_id()])
        
        if not row: 
            Error.conflict("Error while updating", "An error occurred during update, record may have been updated by another user during update.")

        return GeneralJournal(**row)