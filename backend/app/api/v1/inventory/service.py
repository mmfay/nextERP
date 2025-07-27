from .schemas import ( InventoryByDimension )
from datetime import datetime, date
from uuid import uuid4
from typing import List, Optional, Dict
from fastapi import HTTPException, status
from app.data.inventory.in_memory_store import (_inventory, _inventory_dimensions, _inventory_by_dimension)
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
                    aisle=dim.aisle,
                    location=dim.location
                )
            )
    return _inventory_by_dimension
