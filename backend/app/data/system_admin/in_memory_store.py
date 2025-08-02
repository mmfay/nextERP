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
    UserPermissions(userid="user_purch", permission="base"),
    UserPermissions(userid="user_sales", permission="base"),
    UserPermissions(userid="user_inventory", permission="base"),
]

_permissions: list[Permissions] = [
    Permissions(name="base", fullName="Base", description="All Base Level Permissions"),
    Permissions(name="sysAdmin", fullName="System Admin", description="All Permissions"),
    Permissions(name="view_dashboard", fullName="View Dashboard", description="View Dashboard Permissions"),
    Permissions(name="mod_gl", fullName="GL Module", description="General Ledger Module Access"),
    Permissions(name="mod_purch", fullName="Purch Module", description="Purchasing Module Access"),
    Permissions(name="mod_sales", fullName="Sales Module", description="Sales Module Access"),
    Permissions(name="mod_sysAdmin", fullName="Sys Admin Module", description="System Administration Module Access"),
    Permissions(name="setup_gl", fullName="GL Setup", description="General Ledger Setup Access"),
    Permissions(name="setup_purch", fullName="Purch Setup", description="Purchasing Setup Access"),
    Permissions(name="setup_sales", fullName="Sales Setup", description="Sales Setup Access"),
]