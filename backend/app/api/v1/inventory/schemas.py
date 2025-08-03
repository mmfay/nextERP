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
    location: str
    record: int

class InventoryByDimension(BaseModel):
    item: str 
    warehouse: str 
    location: str 
    valuePhysical: Decimal
    valueFinancial: Decimal
    qtyPhysical: int

class Warehouse(BaseModel):
    warehouseID: str 
    warehouseName: str
    addressBook: int
    record: int

class Location(BaseModel):
    locationID: str 
    type: str
    active: int 
    warehouse: int
    record: int

class WarehousesWithLocations(BaseModel):
    warehouseID: str 
    warehouseName: str 
    locationList: list[Location]
