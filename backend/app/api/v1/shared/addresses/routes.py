from fastapi import APIRouter, HTTPException, Query, status
from typing import Optional
from datetime import date
from .service import *
from .schemas import *

router = APIRouter()

@router.get("/addressList")
def address_list() -> list[Address]:
    return get_address_list()