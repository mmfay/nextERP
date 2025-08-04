from .schemas import ( Address )
from datetime import datetime, date
from uuid import uuid4
from typing import List, Optional, Dict
from fastapi import HTTPException, status
from app.data.shared.in_memory_store import (
    _address_book
)
from app.services.sequences import get_next_id
# -----------------------------
# Inventory Value
# -----------------------------
def get_address_list():
    return _address_book
