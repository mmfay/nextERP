from app.api.v1.system_admin.schemas import (
    Users
)
from datetime import datetime, date
from uuid import uuid4

# In-memory store (can be replaced with DB later)
_users: list[Users] = [
    Users(email="admin@example.com", password="password123", enabled=1),
    Users(email="user_gl@example.com", password="password123", enabled=1),
    Users(email="user_purch@example.com", password="password123", enabled=1),
    Users(email="user_sales@example.com", password="password123", enabled=1),
    Users(email="user_inventory@example.com", password="password123", enabled=1),
]