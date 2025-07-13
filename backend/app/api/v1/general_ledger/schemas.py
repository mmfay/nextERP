from pydantic import BaseModel, constr
from typing import Literal  # ✅ Comes from standard typing module


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