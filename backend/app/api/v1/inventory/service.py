from .schemas import ( 
    InventoryByDimension, 
    WarehousesWithLocations, 
    WarehouseCreate, 
    LocationCreate, 
    LocationUpdate, 
    WarehouseUpdate, 
    Warehouse, 
    Location,
    InventoryJournalHeader,
    InventoryJournalLine 
)
from datetime import datetime, date
from uuid import uuid4
from typing import List, Optional, Dict
from fastapi import HTTPException, status, Query
from app.data.inventory.in_memory_store import (
    _inventory, 
    _inventory_dimensions, 
    _inventory_by_dimension,
    _warehouses,
    _locations,
    _warehouses_with_locations,
    _inventory_journal_header,
    _inventory_journal_lines
)
from app.data.shared.in_memory_store import (
    _address_book
)
from app.services.sequences import get_next_id, get_next_record
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
        matching_address = next((add for add in _address_book if add.record == wh.addressBook), None)

        _warehouses_with_locations.append(WarehousesWithLocations(
            warehouseID=wh.warehouseID,
            warehouseName=wh.warehouseName,
            address=matching_address,
            locationList=matching_locations,
            record=wh.record
        ))
    
    return _warehouses_with_locations

def insert_warehouse(data: WarehouseCreate):
   
    record = get_next_record("Warehouse")
 
    _warehouses.append(Warehouse(
        warehouseID=data.warehouseID,
        warehouseName=data.warehouseName,
        addressBook=data.addressRecord,
        record=record,
    ))
    
    return {"status": "created", "record": record}

def insert_location(data: LocationCreate):
    print(data)
    record = get_next_record("Location")
    _locations.append(Location(
        locationID=data.locationID,
        type=data.type,
        active=data.active,
        warehouse=data.warehouse,
        record=record
    ))
    return {"status": "created", "record": record}

def updatelocation(data: LocationUpdate):
    
    for loc in _locations:
        if loc.record == data.record:
            loc.active = data.active
            return {"status": "updated"}
    raise HTTPException(status_code=404, detail="Location not found")

def updatewarehouse(data: WarehouseUpdate):
    for wh in _warehouses:
        if wh.record == data.record:
            wh.warehouseID = data.warehouseID
            wh.warehouseName = data.warehouseName
            wh.addressBook = data.addressRecord
            return {"status": "updated"}
    raise HTTPException(status_code=404, detail="Warehouse not found")

def get_journal_headers(type: int = Query(...)) -> list[InventoryJournalHeader]:
    return [j for j in _inventory_journal_header if j.type == type]
