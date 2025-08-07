from fastapi import APIRouter, HTTPException, Query, status
from typing import Optional
from datetime import date
from .service import *
from .schemas import *

router = APIRouter()

@router.get("/inventory_value")
def inventory_value() -> list[InventoryByDimension]:
    return get_inventory_value()

@router.get("/warehouse_setup")
def warehouse_setup() -> list[WarehousesWithLocations]:
    return get_warehouse_setup()

@router.post("/warehouse", status_code=201)
def create_warehouse(data: WarehouseCreate):
    return insert_warehouse(data)

@router.patch("/warehouse", status_code=200)
def update_warehouse(data: WarehouseUpdate):
    return updatewarehouse(data)

@router.post("/location", status_code=201)
def create_location(data: LocationCreate):
    print(data)
    return insert_location(data)

@router.patch("/location", status_code=200)
def update_location(data: LocationUpdate):
    return updatelocation(data)

@router.get("/inventory_journal", response_model=List[InventoryJournalHeader])
def inventory_journal(type: int = Query(...)):
    return get_journal_headers(type)

@router.get("/journal_lines", response_model=List[InventoryJournalLinesWithDimension])
def journal_lines(journalID: str = Query(...)):
    return get_journal_lines(journalID)