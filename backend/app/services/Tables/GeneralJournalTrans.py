from app.classes.DataBaseConnection import DB
from typing import List, Optional, Dict, Any
from app.api.v1.general_ledger.schemas import (
    GeneralJournalTransRead, GeneralJournalTransCreate, GeneralJournalTransUpdate, GeneralJournalTransWithFinancialDimensionsRead, FinancialDimensionCombosUpdate
)
from app.services.Tables.GeneralJournalTable import GeneralJournalTable
from app.classes.Error import Error
from app.classes.Response import SaveResponse
from app.services.Tables.FinancialDimensionCombos import FinancialDimensionCombos
from app.services.cursor import encode_cursor, decode_cursor

def _to_int(val) -> Optional[int]:
    if val is None:
        return None
    if isinstance(val, int):
        return val
    if isinstance(val, str):
        return int(val)
    # allow things like Decimal
    return int(val)

class GeneralJournalTrans:
    
    @staticmethod
    async def get_page( *, journal_id: str, limit: int = 50, next_cursor: Optional[str] = None, prev_cursor: Optional[str] = None,  # kept for signature parity; not used
        ) -> Dict[str, Any]:
        """
        Fetch journal lines for a given journal_id using keyset pagination.
        - Sorted by record_id DESC so newly inserted lines appear on the first page.
        - Uses asyncpg-style placeholders ($1, $2, ...).
        - Returns limit+1 rows to detect has_next, then trims to 'limit'.

        Cursor format (base64/json):
          {"after_rec": <last_record_id_from_previous_page>}
        """
        cur = decode_cursor(next_cursor)
        after_record: Optional[int] = _to_int(cur.get("after_rec"))

        params: List[Any] = []
        idx = 1

        # Always filter by journal_id (first parameter)
        where_parts = [f"journal_id = ${idx}"]
        params.append(journal_id)
        idx += 1

        # If we have a cursor, page "after" that record_id (for DESC, use <)
        if after_record is not None:
            where_parts.append(f"T.record_id < ${idx}")
            params.append(after_record)
            idx += 1

        where_clause = "WHERE " + " AND ".join(where_parts)

        # Limit placeholder
        limit_placeholder = f"${idx}"
        params.append(limit + 1)  # +1 to detect has_next

        sql = f"""
            SELECT

                T.journal_id      AS "journalID",
                T.line_id         AS "lineID",
                T.account,
                T.description,
                T.debit,
                T.credit,
                T.dimension,
                jsonb_strip_nulls(
                jsonb_build_object(
                    'fd1', FDC.fd1,
                    'fd2', FDC.fd2,
                    'fd3', FDC.fd3,
                    'fd4', FDC.fd4,
                    'fd5', FDC.fd5,
                    'fd6', FDC.fd6,
                    'fd7', FDC.fd7,
                    'fd8', FDC.fd8,
                    'recordID', FDC.record_id
                    )
                )                   AS DIMENSIONS,
                T.company_id      AS "companyID",
                T.version_id      AS "versionID",
                T.record_id       AS "recordID"
                
            FROM GENERALJOURNALTRANS T
            LEFT JOIN FINANCIALDIMENSIONCOMBOS FDC
                ON FDC.record_id = T.dimension
            {where_clause}
            ORDER BY T.record_id DESC
            LIMIT {limit_placeholder};
        """

        rows = await DB.fetch_all(sql, tuple(params))
        print(rows)
        has_next = len(rows) > limit
        rows = rows[:limit]

        items = [GeneralJournalTransWithFinancialDimensionsRead(**dict(r)) for r in rows]

        next_tok = None
        if has_next and rows:
            # last row on this page has the smallest record_id in DESC order
            last_rec_id = rows[-1]["recordID"]
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
    async def findByJournalID(journal_id: str) -> List[GeneralJournalTransRead]:
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
                version_id      AS "versionID",
                record_id       AS "recordID"
            FROM GENERALJOURNALTRANS
            WHERE journal_id = $1
            ORDER BY line_id ASC;
        """
        rows = await DB.fetch_all(sql, (journal_id,))

        return [GeneralJournalTransRead(**dict(r)) for r in rows]

    @staticmethod
    async def upsert(journal_id: str, updates: List[GeneralJournalTransUpdate], inserts: List[GeneralJournalTransCreate]) -> SaveResponse:
        """
        Updates and Inserts Records when saved from front end
        Returns an Okay SaveResponse if fine
        Returns a 409 error on conflict
        """
        # open a transaction, helps with making sure request is either committed or rolled back on error.
        async with DB.transaction():
            
            # lock the header so that when doing updates, if someone else is in the journal, it makes them wait. 
            await GeneralJournalTable.recordLock(journal_id, 1)

            # updates to existing journal lines, (checks record version)
            for line in updates: 
                await GeneralJournalTrans.update(line)
            
            # inserts to journal lines, (TODO)
            for line in inserts:
                await GeneralJournalTrans.insert(line)

        # for now, we will just return success messages when okay rather than replacing record on the front end.
        return SaveResponse(status="success", message=("Journal lines saved and inserted successfully"))
    
    @staticmethod
    async def update(record: GeneralJournalTransUpdate) -> GeneralJournalTransRead:

        sql = """
            UPDATE GENERALJOURNALTRANS
            SET account = $1,
                description = $2,
                debit = $3,
                credit = $4,
                dimension = $5,
                version_id = version_id + 1
            WHERE 
                record_id = $6 
                and journal_id = $7 
                and company_id = $8
                and version_id = $9
            RETURNING 
                line_id as "lineID", 
                journal_id as "journalID", 
                account, 
                description,
                debit, 
                credit, 
                dimension, 
                company_id as "companyID", 
                version_id as "versionID",
                record_id as "recordID";
        """

        # get the dimension
        dimension = record.dimension

        # if its less than 0, it has been modified or is new. check the dimensions and return correct one.
        if (dimension < 0):
            dimension = await FinancialDimensionCombos.findOrCreate(record.dimensions)

        row = await DB.fetch_one(sql, [
            record.account,
            record.description,
            record.debit,
            record.credit,
            dimension,
            record.recordID,
            record.journalID,
            record.companyID,
            record.versionID,
        ])

        if not row:
            Error.conflict("Conflict Error", "The records you are updating have been changed by others, please refresh your client and try again.")
        
        return (GeneralJournalTransRead(**row))
    
    @staticmethod
    async def insert(record: GeneralJournalTransUpdate) -> GeneralJournalTransRead:
        
        sql = """
            INSERT INTO GENERALJOURNALTRANS
                (journal_id, account, description, debit, credit, dimension, company_id, line_id, version_id)
            VALUES
                ($1, $2, $3, $4, $5, $6, $7, COALESCE((SELECT MAX(line_id)+1 from GENERALJOURNALTRANS WHERE company_id = $7 and journal_id = $9),1), $8)
            RETURNING
                line_id     AS "lineID",
                journal_id  AS "journalID",
                account,
                description,
                debit,
                credit,
                dimension,
                company_id AS "companyID",
                version_id AS "versionID",
                record_id  AS "recordID";
        """

        # get the dimension
        dimension = record.dimension

        # if its less than 0, it has been modified or is new. check the dimensions and return correct one.
        if (dimension < 0):
            print(record.dimensions)
            dimension = await FinancialDimensionCombos.findOrCreate(record.dimensions)

        row = await DB.fetch_one(sql, [
            record.journalID,
            record.account,
            record.description,
            record.debit,
            record.credit,
            dimension,
            1,
            1,
            record.journalID,
        ])
        if not row:
            Error.bad_request("Insert failed", "Could not insert journal line.")

        return (GeneralJournalTransRead(**row))
    
    @staticmethod
    async def delete(recordID: int, versionID: int):
        sql = """
            DELETE FROM GENERALJOURNALTRANS
            WHERE record_id  = $1
            AND version_id = $2
            RETURNING record_id;
        """
        DB.transaction()
        row = await DB.fetch_one(sql, [recordID, versionID])
        if not row:
            raise Error.bad_request("Insert failed", "Could not insert journal line.")

            
    
