# app/api/v1/shared/session/request_context.py
from contextvars import ContextVar
from typing import Optional, Any

_user_id_var: ContextVar[Optional[int]] = ContextVar("user_id", default=None)
_company_id_var: ContextVar[Optional[int]] = ContextVar("company_id", default=None)
_session_var: ContextVar[Optional[Any]] = ContextVar("session", default=None)

# set the context
def _set_context(*, user_id: int, company_id: Optional[int], session: Any) -> None:
    _user_id_var.set(user_id)
    _company_id_var.set(company_id)
    _session_var.set(session)

# get user id
def get_user_id() -> Optional[int]:
    return _user_id_var.get()

# get company id
def get_company_id() -> Optional[int]:
    return _company_id_var.get()

# get session
def get_session() -> Optional[Any]:
    return _session_var.get()
