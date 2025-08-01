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