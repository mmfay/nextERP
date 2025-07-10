from pydantic import BaseModel

class Account(BaseModel):
    account: int
    name: str
    amount: int
    location: str
