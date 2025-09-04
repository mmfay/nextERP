# app/api/v1/shared/session/inject.py
from fastapi import Request
from app.api.v1.shared.session.session import SESSION_COOKIE  # "sid"
from app.api.v1.shared.session.request_context import _set_context  # internal setter
from app.classes.Error import Error

async def inject_session(request: Request):

    # from the request, get the session store and the sid from the cookie sent from client.
    store = request.app.state.session_store
    sid = request.cookies.get(SESSION_COOKIE)
    if not sid:
        Error.invalid_credentials("Missing Session", "Server side session is missing")

    # get the session from db
    sess = await store.get(sid)
    if not sess:
        Error.invalid_credentials("Missing Session", "Server side session is missing")

    # update the session in the db
    await store.touch(sid)

    # makes these values available anywhere without needing to pass request
    _set_context(user_id=sess.user_id, company_id=sess.company_id, session=sess)
