from pydantic import BaseModel, constr
from typing import Literal, Dict, List, Optional


class Account(BaseModel):
    account: int
    name: str
    amount: int
    location: str

class MainAccount(BaseModel):
    account: str
    description: str
    type: str

class CreateMainAccount(BaseModel):
    account: constr(min_length=4, max_length=4)
    description: str
    type: Literal["Asset", "Liability", "Equity", "Revenue", "Expense"]

class FinancialDimension(BaseModel):
    id: int
    name: str
    in_use: bool

class UpdateFinancialDimension(BaseModel):
    id: int
    name: str
    in_use: bool

class DimensionValue(BaseModel):
    code: str
    description: str

class AccountCombination(BaseModel):
    account: str
    dimensions: Dict[str, Optional[str]]  # e.g., {"FD_1": "01", "FD_2": None, ..., "FD_8": "02"}


class AccountCombinationRequest(BaseModel):
    account: str
    dimensions: Dict[str, Optional[str]]