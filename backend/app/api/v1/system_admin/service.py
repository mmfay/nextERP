from .schemas import ( Users, UsersCreate )
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

def create_user(user: UsersCreate) -> Users:
    new_user = Users(
        userid=user.userid,
        email=user.email,
        firstName=user.firstName,
        lastName=user.lastName,
        password=user.password,
        enabled=user.enabled,
    )
    _users.append(new_user)
    return new_user

def delete_users_by_userid(userids: list[str]):
    print(userids)
    global _users
    _users = [u for u in _users if u.userid not in userids]

def update_user_enabled(userid: str, enabled: bool):
    for user in _users:
        if user.userid == userid:
            user.enabled = enabled
            return
    raise ValueError("User not found")
