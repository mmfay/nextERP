from app.api.v1.system_admin.schemas import (
    Users
)
from datetime import datetime, date
from uuid import uuid4

# In-memory store (can be replaced with DB later)
_users: list[Users] = [
    Users(email="admin@example.com", userid="admin", firstName="Admin", lastName="Admin", password="password123", enabled=1),
    Users(email="user_gl@example.com", userid="user_gl", firstName="User", lastName="GL",  password="password123", enabled=1),
    Users(email="user_purch@example.com", userid="user_purch", firstName="User", lastName="Purch",  password="password123", enabled=1),
    Users(email="user_sales@example.com", userid="user_sales", firstName="User", lastName="Sales",  password="password123", enabled=1),
    Users(email="user_inventory@example.com", userid="user_inventory", firstName="User", lastName="Inventory",  password="password123", enabled=1),
]