from .schemas import ( Users )
from datetime import datetime, date
from uuid import uuid4
from typing import List, Optional, Dict
from fastapi import HTTPException, status
from app.data.system_admin.in_memory_store import (
    _users
)
from app.services.sequences import get_next_id
# -----------------------------
# Users
# -----------------------------
def get_users() -> list[Users]:
    return _users
