from fastapi import APIRouter, HTTPException, Query, status
from typing import Optional
from datetime import date
from .service import *
from .schemas import *

router = APIRouter()

@router.get("/users")
def users() -> list[Users]:
    return get_users()