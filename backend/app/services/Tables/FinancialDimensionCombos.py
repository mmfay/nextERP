from app.classes.DataBaseConnection import DB
from typing import List, Optional, Dict, Any
from app.api.v1.general_ledger.schemas import (
    GeneralJournalTransRead, GeneralJournalTransCreate, GeneralJournalTransUpdate, GeneralJournalTransWithFinancialDimensionsRead, FinancialDimensionCombosUpdate, FinancialDimensionCombosRead
)
from app.services.Tables.GeneralJournalTable import GeneralJournalTable
from app.classes.Error import Error

class FinancialDimensionCombos:

    @staticmethod
    async def findOrCreate(record: FinancialDimensionCombosUpdate) -> int:
        
        sql = """
            INSERT INTO FINANCIALDIMENSIONCOMBOS
                (fd1,fd2,fd3,fd4,fd5,fd6,fd7,fd8, version_id, company_id)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8, $9, $10)
            ON CONFLICT (
            company_id,
            (coalesce(fd1,'')), (coalesce(fd2,'')), (coalesce(fd3,'')), (coalesce(fd4,'')),
            (coalesce(fd5,'')), (coalesce(fd6,'')), (coalesce(fd7,'')), (coalesce(fd8,''))
            )
            DO UPDATE SET version_id = FINANCIALDIMENSIONCOMBOS.version_id  -- no-op
            RETURNING record_id AS "recordID";
        """

        row = await DB.fetch_one(
            sql, 
                (record.fd1, 
                record.fd2, 
                record.fd3, 
                record.fd4, 
                record.fd5, 
                record.fd6, 
                record.fd7, 
                record.fd8,
                1,
                1)
                )
        if (row):
            return row["recordID"]
        else: 
            Error.conflict("error","error")
        
    async def create(record: FinancialDimensionCombosUpdate) -> int: 
        
        sql = """
            INSERT INTO financialdimensioncombos
                (fd1,fd2,fd3,fd4,fd5,fd6,fd7,fd8, version_id, company_id)
            VALUES
                ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
            RETURNING 
                fd1,
                fd2,
                fd3,
                fd4,
                fd5,
                fd6,
                fd7,
                fd8,
                version_id,
                company_id,
                record_id;
        """

        row = await DB.fetch_one(
            sql, 
                (record.fd1, 
                record.fd2, 
                record.fd3, 
                record.fd4, 
                record.fd5, 
                record.fd6, 
                record.fd7, 
                record.fd8,
                1,
                1)
                )
        if (row):
            return row["record_id"]
        else: 
            return Error.conflict("Error creating dim", "There was an error creating a financial Dimension, please try again")
        