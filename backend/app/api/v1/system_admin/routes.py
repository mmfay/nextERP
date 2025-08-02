from fastapi import APIRouter, HTTPException, Query, status
from typing import Optional
from datetime import date
from .service import *
from .schemas import *

router = APIRouter()

@router.get("/users", response_model=List[Users])
def users() -> list[Users]:
    return get_users()

@router.post("/users", response_model=Users, status_code=status.HTTP_201_CREATED)
def add_user(user: UsersCreate):
    try:
        return create_user(user)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/users", status_code=status.HTTP_204_NO_CONTENT)
def delete_users(request: UsersDeleteRequest):
    try:
        delete_users_by_userid(request.userids)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.patch("/users", status_code=status.HTTP_204_NO_CONTENT)
def patch_user_enabled(request: UserEnablePatchRequest):
    try:
        update_user_enabled(request.userid, request.enabled)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    
@router.get("/permissions", response_model=List[Permissions])
def permissions() -> list[Permissions]:
    return get_permissions()

@router.get("/users_permissions", response_model=List[UsersWithPermissions])
def users_permissions():
    return get_users_permissions()

@router.get("/debug/user_permissions", response_model=List[UsersWithPermissions])
def debug_user_permissions():
    return get_users_permissions()