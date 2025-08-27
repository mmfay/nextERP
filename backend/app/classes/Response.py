# app/api/v1/general_ledger/schemas.py
from typing import Literal
from pydantic import BaseModel

class SaveResponse(BaseModel):
    status: Literal["success"]
    message: str
