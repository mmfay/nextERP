from pydantic import BaseModel, constr
from decimal import Decimal

class Address(BaseModel):
    street: str 
    city: str
    state: str 
    zip: str
    record: int
