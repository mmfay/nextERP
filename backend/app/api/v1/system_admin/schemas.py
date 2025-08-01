from pydantic import BaseModel, constr
from typing import List

class Users(BaseModel):
    email: str
    userid: str
    firstName: str 
    lastName: str
    password: str
    enabled: int

class UsersCreate(BaseModel):
    email: str
    userid: str
    firstName: str
    lastName: str
    password: str
    enabled: bool

class UsersDeleteRequest(BaseModel):
    userids: List[str]

class UserEnablePatchRequest(BaseModel):
    userid: str
    enabled: bool

class UserPermissions(BaseModel):
    userid: str
    permission: str

class Permissions(BaseModel):
    name: str
    description: str