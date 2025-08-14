from typing import Optional
from app.data.general_ledger.in_memory_store import (
    _financial_dimensions
)
from app.api.v1.general_ledger.schemas import (
    FinancialDimension,
    UpdateFinancialDimension
)
from app.services.sequences import get_next_id, get_next_record
class FinancialDimensions:

    @staticmethod
    def findAll() -> list[FinancialDimension]:
        """
        Finds all Financial Dimensions Fields
        """
        return _financial_dimensions
    
    @staticmethod
    def update(data: UpdateFinancialDimension) -> Optional[FinancialDimension]:
        """
        Partially update a FinancialDimension.
        Returns the updated object, or None if not found.
        """
        for i, dim in enumerate(_financial_dimensions):
            if dim.id == data.id:
                _financial_dimensions[i] = FinancialDimension(**data.dict())
                return _financial_dimensions[i]
        return None