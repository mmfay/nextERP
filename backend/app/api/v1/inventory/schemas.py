from pydantic import BaseModel, constr
from decimal import Decimal

class Inventory(BaseModel):
    item: str
    dimension: int
    valuePhysical: Decimal 
    valueFinancial: Decimal 
    qtyPhysical: int
    closed: int
    record: int

class InventoryDimensions(BaseModel):
    warehouse: str
    aisle: str 
    location: str
    record: int

class InventoryByDimension(BaseModel):
    item: str 
    warehouse: str 
    aisle: str
    location: str 
    valuePhysical: Decimal
    valueFinancial: Decimal
    qtyPhysical: int
