from fastapi import APIRouter, Request, Response, HTTPException
from jose import jwt
from datetime import datetime, timedelta

router = APIRouter()

SECRET_KEY = "your-secret-key"  # ⚠️ Must match frontend middleware
ALGORITHM = "HS256"
COOKIE_NAME = "token"

@router.post("/login")
async def login(request: Request, response: Response):
    data = await request.json()
    email = data.get("email")
    password = data.get("password")

    # 🔐 Replace this with real user lookup
    if email == "user@example.com" and password == "password123":
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
            secure=False,  # Set to True in production (HTTPS)
            samesite="Lax",
            max_age=86400,
        )

        return {"message": "Login successful"}

    raise HTTPException(status_code=401, detail="Invalid credentials")
