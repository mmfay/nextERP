from fastapi import APIRouter, Request, Response, HTTPException, Depends
from jose import jwt, JWTError
from datetime import datetime, timedelta
from app.data.system_admin.in_memory_store import _users, _user_permissions
from app.api.v1.system_admin.schemas import Users

router = APIRouter()

# ⚠️ Replace in production
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
COOKIE_NAME = "token"

# 🔍 Find user in _users by email
def get_user_by_email(email: str) -> Users | None:
    for user in _users:
        if user.email == email:
            return user
    return None

# 🔐 Dependency to extract user from secure cookie
def get_current_user(request: Request):
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        user = get_user_by_email(email)
        if not email or not user:
            raise HTTPException(status_code=401, detail="Invalid token or user not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ✅ Login route: validates and issues JWT via HttpOnly cookie
@router.post("/login")
async def login(request: Request, response: Response):

    data = await request.json()
    email = data.get("email")
    password = data.get("password")

    user = get_user_by_email(email)

    if user and user.password == password and user.enabled:
        token = jwt.encode(
            {"sub": user.email, "exp": datetime.utcnow() + timedelta(days=1)},
            SECRET_KEY,
            algorithm=ALGORITHM,
        )

        response.set_cookie(
            key=COOKIE_NAME,
            value=token,
            httponly=True,
            secure=False,  # ✅ Set to True if using HTTPS in prod
            samesite="Lax",
            max_age=86400,
        )

        return {"message": "Login successful"}

    raise HTTPException(status_code=401, detail="Invalid credentials")

# ✅ /me route: return current user + permissions
@router.get("/me")
async def get_me(user: dict = Depends(get_current_user)):

    user_perms = [p.permission for p in _user_permissions if p.userid == user.userid]
    is_sys_admin = "sysAdmin" in user_perms

    return {
        "user": {
            "id": user.userid,
            "name": f"{user.firstName} {user.lastName}",
            "email": user.email,
            "is_sys_admin": is_sys_admin,  # Replace with real field if needed
        },
        "permissions": user_perms
    }

# ✅ Optional logout route
@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(COOKIE_NAME)
    return {"message": "Logged out"}