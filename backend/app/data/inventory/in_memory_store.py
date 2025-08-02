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
    InventoryDimensions(warehouse="1", location="a", record=1),
    InventoryDimensions(warehouse="1", location="b", record=2),
    InventoryDimensions(warehouse="1", location="a", record=3),
    InventoryDimensions(warehouse="1", location="b", record=4),
    InventoryDimensions(warehouse="1", location="c", record=5),
]

_inventory_by_dimension: list [InventoryByDimension] = [
    
]