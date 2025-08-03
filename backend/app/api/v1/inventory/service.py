from .schemas import ( InventoryByDimension, WarehousesWithLocations )
from datetime import datetime, date
from uuid import uuid4
from typing import List, Optional, Dict
from fastapi import HTTPException, status
from app.data.inventory.in_memory_store import (
    _inventory, 
    _inventory_dimensions, 
    _inventory_by_dimension,
    _warehouses,
    _locations,
    _warehouses_with_locations
    )
from app.data.shared.in_memory_store import *
from app.services.sequences import get_next_id
# -----------------------------
# Inventory Value
# -----------------------------
def get_inventory_value() -> list[InventoryByDimension]:

    # clear the last request
    _inventory_by_dimension.clear()

    # map for dimensions
    dimension_map = {d.record: d for d in _inventory_dimensions}

    # simulate inventory/dimensions join 
    for inv in _inventory: 

        dim = dimension_map.get(inv.record)
        
        if dim: 
            _inventory_by_dimension.append(
                InventoryByDimension(
                    item=inv.item,
                    valuePhysical=inv.valuePhysical,
                    valueFinancial=inv.valueFinancial,
                    qtyPhysical=inv.qtyPhysical,
                    warehouse=dim.warehouse,
                    location=dim.location
                )
            )
    return _inventory_by_dimension

def get_warehouse_setup():
    
    _warehouses_with_locations.clear()

    for wh in _warehouses:

        matching_locations = [loc for loc in _locations if loc.warehouse == wh.record]

        _warehouses_with_locations.append(WarehousesWithLocations(
            warehouseID=wh.warehouseID,
            warehouseName=wh.warehouseName,
            locationList=matching_locations
        ))
        
    return _warehouses_with_locations
