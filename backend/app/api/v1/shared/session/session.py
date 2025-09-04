# backend/app/shared/session.py
import secrets
from dataclasses import dataclass
from typing import Optional, Tuple
from datetime import datetime, timedelta

from fastapi import Request, Response, HTTPException

SESSION_COOKIE = "sid"
SESSION_TTL_SECONDS = 60 * 60 * 24  # 24h

@dataclass
class SessionData:
    sid: str
    user_id: int
    company_id: Optional[int]
    created_at: datetime
    last_seen: datetime
    expires_at: datetime

class PgSessionStore:
    """
    Postgres-backed session store using an asyncpg pool at app.state.db.
    Exposes create/get/touch/update/delete.
    """
    def __init__(self, pool, table: str = "sessions"):
        self.pool = pool
        self.table = table

    def _expiry(self) -> datetime:
        return datetime.utcnow() + timedelta(seconds=SESSION_TTL_SECONDS)

    # create session
    async def create(self, *, user_id: int, company_id: Optional[int] = None) -> str:
        sid = secrets.token_urlsafe(32)
        async with self.pool.acquire() as conn:
            await conn.execute(
                f"""
                INSERT INTO {self.table} (sid, user_id, company_id, created_at, last_seen, expires_at)
                VALUES ($1, $2, $3, now(), now(), $4)
                """,
                sid, user_id, company_id, self._expiry()
            )
        return sid

    # get session
    async def get(self, sid: str) -> Optional[SessionData]:
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                f"""
                SELECT sid, user_id, company_id, created_at, last_seen, expires_at
                FROM {self.table}
                WHERE sid = $1 AND expires_at > now()
                """,
                sid
            )
        if not row:
            return None
        return SessionData(**dict(row))

    # update session
    async def touch(self, sid: str) -> None:
        # slide TTL and update last_seen
        async with self.pool.acquire() as conn:
            await conn.execute(
                f"""
                UPDATE {self.table}
                SET last_seen = now(), expires_at = $2
                WHERE sid = $1
                """,
                sid, self._expiry()
            )

    # update session
    async def update(self, sid: str, *, company_id: Optional[int] = None) -> Optional[SessionData]:
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                f"""
                UPDATE {self.table}
                SET company_id = $2, last_seen = now(), expires_at = $3
                WHERE sid = $1 AND expires_at > now()
                RETURNING sid, user_id, company_id, created_at, last_seen, expires_at
                """,
                sid, company_id, self._expiry()
            )
        return SessionData(**dict(row)) if row else None

    # delete session
    async def delete(self, sid: str) -> None:
        async with self.pool.acquire() as conn:
            await conn.execute(
                f"DELETE FROM {self.table} WHERE sid = $1",
                sid
            )

# get session objects
async def get_session_objects(request: Request) -> Tuple[PgSessionStore, str, Optional[SessionData]]:
    store: PgSessionStore = request.app.state.session_store
    sid: Optional[str] = request.cookies.get(SESSION_COOKIE)
    if not sid:
        return store, "", None
    data = await store.get(sid)
    if data:
        await store.touch(sid)
    return store, sid, data

# require session
async def require_session(request: Request) -> Tuple[PgSessionStore, str, SessionData]:
    store, sid, sess = await get_session_objects(request)
    if not sid or not sess:
        raise HTTPException(status_code=401, detail="Missing or expired session")
    return store, sid, sess

# set session cookie
def set_session_cookie(response: Response, sid: str):
    response.set_cookie(
        key=SESSION_COOKIE,
        value=sid,
        httponly=True,
        secure=False,     # True in prod (HTTPS)
        samesite="Lax",
        max_age=SESSION_TTL_SECONDS,
        path="/",
    )

# clear session cookie
def clear_session_cookie(response: Response):
    response.delete_cookie(SESSION_COOKIE, path="/")
