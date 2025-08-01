from app.api.v1.system_admin.schemas import (
    Users,
    UserPermissions,
    Permissions
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

_user_permissions: list[UserPermissions] = [
    UserPermissions(userid="admin", permission="sysAdmin"),
    UserPermissions(userid="user_gl", permission="base"),
    UserPermissions(userid="user_gl", permission="mod_gl"),
    UserPermissions(userid="user_gl", permission="setup_gl"),
]

_permissions: list[Permissions] = [
    Permissions(name="base", description="All Base Level Permissions"),
    Permissions(name="view_dashboard", description="View Dashboard Permissions"),
    Permissions(name="mod_gl", description="General Ledger Module Access"),
    Permissions(name="mod_purch", description="Purchasing Module Access"),
    Permissions(name="mod_sales", description="Sales Module Access"),
    Permissions(name="mod_sysAdmin", description="System Administration Module Access"),
    Permissions(name="setup_gl", description="General Ledger Setup Access"),
    Permissions(name="setup_purch", description="Purchasing Setup Access"),
    Permissions(name="setup_sales", description="Sales Setup Access"),
]