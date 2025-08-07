from pydantic import BaseModel, constr
from decimal import Decimal
from app.api.v1.shared.addresses.schemas import ( Address )

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
    address: Address
    locationList: list[Location]
    record: int

class LocationCreate(BaseModel):
    locationID: str
    type: str
    active: int
    warehouse: int  # warehouse record

class LocationUpdate(BaseModel):
    record: int
    active: int

class WarehouseCreate(BaseModel):
    warehouseID: str
    warehouseName: str
    addressRecord: int

class WarehouseUpdate(BaseModel):
    warehouseID: str
    warehouseName: str
    addressRecord: int
    record: int

class InventoryJournalHeader(BaseModel):
    journalID: str
    status: int 
    type: int 
    description: str 
    record: int

class InventoryJournalLine(BaseModel):
    journalID: str
    item: str 
    dimension: int
    qty: int 
    cost: Decimal
    record: int

class InventoryJournalLinesWithDimension(BaseModel):
    journalID: str
    item: str 
    dimension: InventoryDimensions
    qty: int 
    cost: Decimal
    record: int
