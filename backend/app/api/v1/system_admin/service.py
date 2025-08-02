from .schemas import ( Users, UsersCreate, Permissions, UsersWithPermissions, UserPermissions )
from datetime import datetime, date
from uuid import uuid4
from typing import List, Optional, Dict
from fastapi import HTTPException, status
from app.data.system_admin.in_memory_store import (
    _users,
    _permissions,
    _user_permissions
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

def get_permissions() -> list[Permissions]:
    return _permissions

def get_users_permissions() -> list[UsersWithPermissions]:
    users_with_perms = []

    for user in _users:
        # Find all permission names for this user
        user_perms = [up.permission for up in _user_permissions if up.userid == user.userid]

        # Join permission details
        detailed_perms = [
            Permissions(
                name=perm.name,
                fullName=perm.fullName,
                description=perm.description
            )
            for perm in _permissions
            if perm.name in user_perms
        ]

        # Create the response object
        users_with_perms.append(UsersWithPermissions(
            userid=user.userid,
            email=user.email,
            firstName=user.firstName,
            lastName=user.lastName,
            enabled=user.enabled,
            permissions=detailed_perms
        ))

    return users_with_perms

def assign_permission(userid: str, permission: str) -> list[UserPermissions]:
    # Check if it already exists
    exists = any(
        up.userid == userid and up.permission == permission
        for up in _user_permissions
    )

    if not exists:
        _user_permissions.append(UserPermissions(userid=userid, permission=permission))

    # Return updated list for this user
    return [up for up in _user_permissions if up.userid == userid]


def remove_permission(userid: str, permission: str) -> list[UserPermissions]:
    global _user_permissions

    # Filter out the record to delete
    _user_permissions = [
        up for up in _user_permissions
        if not (up.userid == userid and up.permission == permission)
    ]

    # Return updated list for this user
    return [up for up in _user_permissions if up.userid == userid]
