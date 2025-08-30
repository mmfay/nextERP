from pydantic import BaseModel, constr, Field
from typing import Literal, Dict, List, Optional, Any
from decimal import Decimal
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
    dimension: Optional[int] = None
    dimensions: Dict[str, Any] = {}
    companyID: int 
    recordID: int
class Config:
        extra = "ignore"
# -----------------------------
# FinancialDimensionCombos
# -----------------------------
class FinancialDimensionCombos(BaseModel):
    # Base Fields
    fd1: Optional[str] = None
    fd2: Optional[str] = None 
    fd3: Optional[str] = None
    fd4: Optional[str] = None
    fd5: Optional[str] = None
    fd6: Optional[str] = None
    fd7: Optional[str] = None
    fd8: Optional[str] = None

class FinancialDimensionCombosRead(FinancialDimensionCombos):
    # When Read, these should exist as well
    versionID: int = Field(default=1, ge=1) 
    companyID: int 
    recordID: int

class FinancialDimensionCombosUpdate(FinancialDimensionCombos):
    recordID: int
    pass
# -----------------------------
# Journal Lines
# -----------------------------
class GeneralJournalTrans(BaseModel):
    # Base Fields for General Jouranl Trans
    journalID: str
    account: str
    description: Optional[str] = None
    debit: Decimal
    credit: Decimal
    dimension: Optional[int] = None
    dimensions: Optional[FinancialDimensionCombos] = None

class GeneralJournalTransRead(GeneralJournalTrans):
    # When reading from DB, these fields should exist as well.
    lineID: int
    companyID: int 
    versionID: int
    recordID: int

class GeneralJournalTransCreate(GeneralJournalTrans):
    # When creating, these must have values prior to added to the DB.
    lineID: int
    companyID: int 
    versionID: int = Field(default=1, ge=1) 

class GeneralJournalTransUpdate(GeneralJournalTransRead):
    # Update should carry all the properties of a read.
    pass

class GeneralJournalTransWithFinancialDimensionsRead(GeneralJournalTransRead):
    # Like a join to Financial Dimensions to show the data in its own json list per record.
    dimensions: Dict[str, Any] = {}

class PostingSetup(BaseModel):
    module: int
    type: str
    accountType: str 
    account: str


