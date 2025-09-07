# app/api/v1/general_ledger/schemas.py
from typing import Literal, Any, Optional
from pydantic import BaseModel

class SaveResponse(BaseModel):
    status: Literal["success"]
    message: str

class ValidationResponse(BaseModel):
    valid: bool
    message: str
    record: Optional[Any] = None
