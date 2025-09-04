from fastapi import APIRouter, Request, Response, HTTPException, Depends, status
from jose import jwt, JWTError
from datetime import datetime, timedelta
from app.data.system_admin.in_memory_store import _users, _user_permissions
from app.api.v1.system_admin.schemas import Users
from app.api.v1.shared.session.session import set_session_cookie, SESSION_COOKIE 
from app.classes.Error import Error
from app.classes.Response import SaveResponse

router = APIRouter()

# replace in production and move to .env
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
COOKIE_NAME = "token"

# email user helper, to be moved to user class later.
def get_user_by_email(email: str) -> Users | None:
    for user in _users:
        if user.email == email:
            return user
    return None

# current user helper, to be moved to user class later.
def get_current_user(request: Request):
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        Error.invalid_credentials("Invalid Credentials", "Missing token");

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        user = get_user_by_email(email)
        if not email or not user:
            Error.invalid_credentials("Invalid Credentials", "Invalid token or user not found");
        return user
    except JWTError:
        Error.invalid_credentials("Invalid Credentials", "Invalid token");

# login route validates and issues JWT via HttpOnly cookie
@router.post("/login", response_model=SaveResponse, status_code=status.HTTP_200_OK)
async def login(request: Request, response: Response):

    # gets data and extracts email and password
    data = await request.json()
    email = data.get("email")
    password = data.get("password")

    # gets user
    user = get_user_by_email(email)

    # if there is an active user
    if user and user.password == password and user.enabled:
        
        # build the token
        token = jwt.encode(
            {"sub": user.email, "exp": datetime.utcnow() + timedelta(days=1)},
            SECRET_KEY,
            algorithm=ALGORITHM,
        )

        # attach token to the cookie
        response.set_cookie(
            key=COOKIE_NAME,
            value=token,
            httponly=True,
            secure=False,  # TODO to True if using HTTPS in prod
            samesite="Lax",
            max_age=86400,
        )

        # get the session_store variable 
        store = request.app.state.session_store

        # get the default company from the user, if there isn't one, set one.
        default_company_id = getattr(user, "defaultCompanyID", 1) 

        # build sid and set cookie
        sid = await store.create(user_id=user.userid, company_id=default_company_id)
        set_session_cookie(response, sid)

        return SaveResponse(status="success", message="Login successful")

    Error.invalid_credentials("Invalid Credentials", "Login could not be found.");

# me route gets user and permissions
@router.get("/me")
async def get_me(user: dict = Depends(get_current_user)):

    # gets user perms and check if sysAdmin
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

# logout route to end user session
@router.post("/logout", response_model=SaveResponse, status_code=status.HTTP_200_OK)
async def logout(response: Response):

    # delete cookies
    response.delete_cookie(COOKIE_NAME, path="/")
    response.delete_cookie(SESSION_COOKIE, path="/")

    # return message
    return SaveResponse(status="success", message="Logout successful")