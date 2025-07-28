from pydantic import BaseModel, constr

class Users(BaseModel):
    email: str
    password: str
    enabled: int