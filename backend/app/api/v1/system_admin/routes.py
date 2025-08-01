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