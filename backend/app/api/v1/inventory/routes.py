from fastapi import APIRouter, HTTPException, Query, status
from typing import Optional
from datetime import date
from .service import *
from .schemas import *

router = APIRouter()

@router.get("/inventory_value")
def inventory_value() -> list[InventoryByDimension]:
    return get_inventory_value()
