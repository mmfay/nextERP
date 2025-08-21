from pydantic import BaseModel, constr
from typing import Literal, Dict, List, Optional
from datetime import date, datetime
from uuid import UUID

class Account(BaseModel):
    account: int
    name: str
    amount: int
    location: str

class MainAccount(BaseModel):
    account: str
    description: str
    type: str
    category: str
    company: int
    record: int

class CreateMainAccount(BaseModel):
    account: constr(min_length=4, max_length=4)
    description: str
    category: str
    type: Literal["Asset", "Liability", "Equity", "Revenue", "Expense"]

class FinancialDimension(BaseModel):
    id: int
    name: str
    in_use: bool

class UpdateFinancialDimension(BaseModel):
    id: int
    name: str
    in_use: bool

class FinancialDimensionValue(BaseModel):
    code: str
    description: str
    dimension: int 
    record: int

class CreateFinancialDimensionValue(BaseModel):
    code: str
    description: str

class AccountCombination(BaseModel):
    account: str
    dimensions: Dict[str, Optional[str]]  # e.g., {"FD_1": "01", "FD_2": None, ..., "FD_8": "02"}


class AccountCombinationRequest(BaseModel):
    account: str
    dimensions: Dict[str, Optional[str]]

class GLEntry(BaseModel):
    id: UUID
    journal_date: date
    account_number: str
    account_name: str
    debit: float
    credit: float
    currency: str = "USD"
    financial_dimensions: Dict[str, Optional[str]]  # e.g. {"FD_1": "01", ...}
    reference: Optional[str]
    description: Optional[str]
    source: Optional[str]
    created_at: datetime
    posted_by: str

class TrialBalanceEntry(BaseModel):
    account: str
    name: str
    debit: float
    credit: float
    balance: float

class SubledgerEntry(BaseModel):
    id: UUID
    subledger_type: str  # "AR", "AP", "Inventory", etc.
    reference: str       # Match GL reference
    document_date: date
    document_number: str
    amount: float
    currency: str
    party: str           # Customer, Vendor, etc.
    description: str
    posted_to_gl: bool
    gl_entry_ids: list[UUID]
    created_at: datetime

class GeneralJournal(BaseModel):
    journalID: str
    document_date: date
    type: str
    description: str
    status: str
    posted: Optional[datetime]
    companyID: int
    recordID: int

class CreateGeneralJournal(BaseModel):
    document_date: date
    type: str
    description: str

class JournalLine(BaseModel):
    lineID: int
    journalID: str
    account: str
    description: Optional[str] = None
    debit: float
    credit: float

class JournalLineNew(BaseModel):
    lineID: int
    journalID: str
    account: str
    description: Optional[str] = None
    debit: float
    credit: float
    companyID: int 
    recordID: int

class PostingSetup(BaseModel):
    module: int
    type: str
    accountType: str 
    account: str


