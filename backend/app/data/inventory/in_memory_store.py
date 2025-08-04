from app.api.v1.inventory.schemas import *
from datetime import datetime, date
from uuid import uuid4

# In-memory store (can be replaced with DB later)
_inventory: list[Inventory] = [
    Inventory(item="1", dimension=1, valuePhysical=1.00, valueFinancial=2.00, qtyPhysical=3, closed=0, record=1),
    Inventory(item="2", dimension=2, valuePhysical=1.00, valueFinancial=2.00, qtyPhysical=3, closed=0, record=2),
    Inventory(item="3", dimension=3, valuePhysical=1.00, valueFinancial=2.00, qtyPhysical=3, closed=0, record=3),
    Inventory(item="4", dimension=4, valuePhysical=1.00, valueFinancial=2.00, qtyPhysical=3, closed=0, record=4),
    Inventory(item="5", dimension=5, valuePhysical=1.00, valueFinancial=2.00, qtyPhysical=3, closed=0, record=5),
]

_inventory_dimensions: list[InventoryDimensions] = [
    InventoryDimensions(warehouse="WH01", location="LOC01", record=1),
    InventoryDimensions(warehouse="WH01", location="LOC02", record=2),
    InventoryDimensions(warehouse="WH02", location="LOC03", record=3),
    InventoryDimensions(warehouse="WH03", location="LOC04", record=4),
    InventoryDimensions(warehouse="WH03", location="LOC04", record=5),
]

# Used as an in Memory Join
_inventory_by_dimension: list[InventoryByDimension] = [
    
]

_warehouses: list[Warehouse] = [
    Warehouse(warehouseID="WH01", warehouseName="Sacramento DC", addressBook=1, record=1),
    Warehouse(warehouseID="WH02", warehouseName="Tahoe Warehouse", addressBook=2, record=2),
    Warehouse(warehouseID="WH03", warehouseName="San Fran Warehouse", addressBook=3, record=3),
]

_locations: list[Location] = [
    Location(locationID="LOC01", type="Pick", active=1, warehouse=1, record=1),
    Location(locationID="LOC02", type="Bulk", active=1, warehouse=1, record=2),
    Location(locationID="LOC03", type="Staging", active=1, warehouse=2, record=3),
    Location(locationID="LOC04", type="Pick", active=1, warehouse=3, record=4),
]

#Used as an in Memory Join
_warehouses_with_locations: list[WarehousesWithLocations] = [

]