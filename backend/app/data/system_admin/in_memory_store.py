from app.api.v1.system_admin.schemas import (
    Users,
    UserPermissions,
    Permissions
)
from datetime import datetime, date
from uuid import uuid4

from app.api.v1.system_admin.schemas import Users

# In-memory store (can be replaced with DB later)
_users: list[Users] = [
    Users(email="admin@example.com", userid="admin", firstName="Admin", lastName="Admin", password="password123", enabled=1),
    Users(email="user_gl@example.com", userid="user_gl", firstName="User", lastName="GL",  password="password123", enabled=1),
    Users(email="user_purch@example.com", userid="user_purch", firstName="User", lastName="Purch",  password="password123", enabled=1),
    Users(email="user_sales@example.com", userid="user_sales", firstName="User", lastName="Sales",  password="password123", enabled=1),
    Users(email="user_inventory@example.com", userid="user_inventory", firstName="User", lastName="Inventory",  password="password123", enabled=1),
    Users(email="user_006@example.com", userid="user_006", firstName="User", lastName="006", password="password123", enabled=1),
    Users(email="user_007@example.com", userid="user_007", firstName="User", lastName="007", password="password123", enabled=1),
    Users(email="user_008@example.com", userid="user_008", firstName="User", lastName="008", password="password123", enabled=1),
    Users(email="user_009@example.com", userid="user_009", firstName="User", lastName="009", password="password123", enabled=1),
    Users(email="user_010@example.com", userid="user_010", firstName="User", lastName="010", password="password123", enabled=1),
    Users(email="user_011@example.com", userid="user_011", firstName="User", lastName="011", password="password123", enabled=1),
    Users(email="user_012@example.com", userid="user_012", firstName="User", lastName="012", password="password123", enabled=1),
    Users(email="user_013@example.com", userid="user_013", firstName="User", lastName="013", password="password123", enabled=1),
    Users(email="user_014@example.com", userid="user_014", firstName="User", lastName="014", password="password123", enabled=1),
    Users(email="user_015@example.com", userid="user_015", firstName="User", lastName="015", password="password123", enabled=1),
    Users(email="user_016@example.com", userid="user_016", firstName="User", lastName="016", password="password123", enabled=1),
    Users(email="user_017@example.com", userid="user_017", firstName="User", lastName="017", password="password123", enabled=1),
    Users(email="user_018@example.com", userid="user_018", firstName="User", lastName="018", password="password123", enabled=1),
    Users(email="user_019@example.com", userid="user_019", firstName="User", lastName="019", password="password123", enabled=1),
    Users(email="user_020@example.com", userid="user_020", firstName="User", lastName="020", password="password123", enabled=1),
    Users(email="user_021@example.com", userid="user_021", firstName="User", lastName="021", password="password123", enabled=1),
    Users(email="user_022@example.com", userid="user_022", firstName="User", lastName="022", password="password123", enabled=1),
    Users(email="user_023@example.com", userid="user_023", firstName="User", lastName="023", password="password123", enabled=1),
    Users(email="user_024@example.com", userid="user_024", firstName="User", lastName="024", password="password123", enabled=1),
    Users(email="user_025@example.com", userid="user_025", firstName="User", lastName="025", password="password123", enabled=1),
    Users(email="user_026@example.com", userid="user_026", firstName="User", lastName="026", password="password123", enabled=1),
    Users(email="user_027@example.com", userid="user_027", firstName="User", lastName="027", password="password123", enabled=1),
    Users(email="user_028@example.com", userid="user_028", firstName="User", lastName="028", password="password123", enabled=1),
    Users(email="user_029@example.com", userid="user_029", firstName="User", lastName="029", password="password123", enabled=1),
    Users(email="user_030@example.com", userid="user_030", firstName="User", lastName="030", password="password123", enabled=1),
    Users(email="user_031@example.com", userid="user_031", firstName="User", lastName="031", password="password123", enabled=1),
    Users(email="user_032@example.com", userid="user_032", firstName="User", lastName="032", password="password123", enabled=1),
    Users(email="user_033@example.com", userid="user_033", firstName="User", lastName="033", password="password123", enabled=1),
    Users(email="user_034@example.com", userid="user_034", firstName="User", lastName="034", password="password123", enabled=1),
    Users(email="user_035@example.com", userid="user_035", firstName="User", lastName="035", password="password123", enabled=1),
    Users(email="user_036@example.com", userid="user_036", firstName="User", lastName="036", password="password123", enabled=1),
    Users(email="user_037@example.com", userid="user_037", firstName="User", lastName="037", password="password123", enabled=1),
    Users(email="user_038@example.com", userid="user_038", firstName="User", lastName="038", password="password123", enabled=1),
    Users(email="user_039@example.com", userid="user_039", firstName="User", lastName="039", password="password123", enabled=1),
    Users(email="user_040@example.com", userid="user_040", firstName="User", lastName="040", password="password123", enabled=1),
    Users(email="user_041@example.com", userid="user_041", firstName="User", lastName="041", password="password123", enabled=1),
    Users(email="user_042@example.com", userid="user_042", firstName="User", lastName="042", password="password123", enabled=1),
    Users(email="user_043@example.com", userid="user_043", firstName="User", lastName="043", password="password123", enabled=1),
    Users(email="user_044@example.com", userid="user_044", firstName="User", lastName="044", password="password123", enabled=1),
    Users(email="user_045@example.com", userid="user_045", firstName="User", lastName="045", password="password123", enabled=1),
    Users(email="user_046@example.com", userid="user_046", firstName="User", lastName="046", password="password123", enabled=1),
    Users(email="user_047@example.com", userid="user_047", firstName="User", lastName="047", password="password123", enabled=1),
    Users(email="user_048@example.com", userid="user_048", firstName="User", lastName="048", password="password123", enabled=1),
    Users(email="user_049@example.com", userid="user_049", firstName="User", lastName="049", password="password123", enabled=1),
    Users(email="user_050@example.com", userid="user_050", firstName="User", lastName="050", password="password123", enabled=1),
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