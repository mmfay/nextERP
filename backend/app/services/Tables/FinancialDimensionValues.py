from app.data.general_ledger.in_memory_store import (
    _financial_dimension_values
)
from app.api.v1.general_ledger.schemas import (
    CreateFinancialDimensionValue,
    FinancialDimensionValue,
)
from app.services.sequences import get_next_id, get_next_record
class FinancialDimensionValues: 

    @staticmethod 
    def findByDimension(dimension_id: int) -> list[FinancialDimensionValue]:
        """
        Finds a Financial Dimension Value by Dimension ID.
        Returns record if found.
        """
        filtered = [
            dv for dv in _financial_dimension_values
            if dv.dimension == dimension_id
        ]
        return filtered
    
    @staticmethod
    def find(record_id: int) -> FinancialDimensionValue:
        """
        Finds a Financial Dimension Value by Record ID.
        Returns record if found.
        """
        filtered = [
            dv for dv in _financial_dimension_values
            if dv.record == record_id
        ]
        return filtered
    
    @staticmethod
    def create(dimension_id: int, value: CreateFinancialDimensionValue) -> bool:
        """
        Create a new Financial Dimension Value for the given dimension.
        Returns True if created, False if a duplicate code exists in that dimension.
        """
        code = value.code.strip()

        # Duplicate check *within the same dimension*
        if any(v.dimension == dimension_id and v.code == code for v in _financial_dimension_values):
            return False

        # New Record
        new_entry = FinancialDimensionValue(
            record                  = get_next_record("FDV"),
            dimension               = dimension_id,
            code                    = code,
            description             = (value.description or "").strip(),
        )

        # append record return true for success
        _financial_dimension_values.append(new_entry)
        return True
    
    @staticmethod
    def delete(dimension_id: int, code: str) -> bool:
        """
        Deletes a FinancialDimensionValue for the given dimension & code.
        Returns True if deleted, False if not found.
        """
        code = code.strip()
        for i, v in enumerate(_financial_dimension_values):
            if v.dimension == dimension_id and v.code == code:
                _financial_dimension_values.pop(i)
                return True
        return False