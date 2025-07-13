from fastapi import APIRouter, Request, Response, HTTPException, Depends
from jose import jwt, JWTError
from datetime import datetime, timedelta

router = APIRouter()

# ⚠️ Replace in production
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
COOKIE_NAME = "token"

# 🧪 Simulated user + permission store
USER_DB = {
    "user@example.com": {
        "id": "u_123",
        "name": "Matt Fay",
        "is_sys_admin": False,
        "permissions": [
            "base",
            "view_dashboard",
            "mod_gl",
            "setup_gl"
        ]
    },
    "admin@example.com": {
        "id": "u_admin",
        "name": "Sys Admin",
        "is_sys_admin": True,
        "permissions": [
        ]
    }
}

# 🔐 Dependency to extract user from secure cookie
def get_current_user(request: Request):
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not email or email not in USER_DB:
            raise HTTPException(status_code=401, detail="Invalid token or user not found")
        return USER_DB[email]
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ✅ Login route: validates and issues JWT via HttpOnly cookie
@router.post("/login")
async def login(request: Request, response: Response):
    data = await request.json()
    email = data.get("email")
    password = data.get("password")

    # 🔒 Replace with DB check
    if email in USER_DB and password == "password123":
        token = jwt.encode(
            {
                "sub": email,
                "exp": datetime.utcnow() + timedelta(days=1),
            },
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
    return {
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["id"] + "@example.com",
            "is_sys_admin": user.get("is_sys_admin", False)
        },
        "permissions": user["permissions"]
    }

# ✅ Optional logout route
@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(COOKIE_NAME)
    return {"message": "Logged out"}