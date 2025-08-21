# app/db.py
from __future__ import annotations
import os
from contextlib import asynccontextmanager
from typing import Any, Iterable, Optional, Sequence, List, Dict

import asyncpg


def _parse_rowcount(tag: str) -> int:
    """
    asyncpg's execute() returns tags like: 'INSERT 0 1', 'UPDATE 3', 'DELETE 0'.
    We parse the last integer if present; otherwise 0.
    """
    try:
        parts = tag.split()
        for token in reversed(parts):
            if token.isdigit():
                return int(token)
    except Exception:
        pass
    return 0


class DB:
    """
    Lightweight async Postgres access layer using asyncpg + pooling.

    Usage after app startup:
        rows = await DB.fetch_all("SELECT * FROM mytable WHERE col = $1", [val])

    Notes:
      - Placeholders use $1, $2, ... (asyncpg style)
      - fetch_* return dict-like rows (converted to plain dicts)
      - execute returns affected row count (parsed from command tag)
    """

    _pool: Optional[asyncpg.Pool] = None

    # ---------------------------
    # Pool lifecycle
    # ---------------------------
    @classmethod
    async def init_pool(
        cls,
        dsn: Optional[str] = None,
        min_size: int = 1,
        max_size: int = 10,
    ) -> None:
        """
        Initialize a global async connection pool. Call once on app startup.
        DSN can be a URL like: postgresql://user:pass@host:5432/dbname
        """
        if cls._pool is not None:
            return

        dsn = dsn or os.getenv("DATABASE_URL") or os.getenv("POSTGRES_DSN")
        if not dsn:
            raise RuntimeError("No DSN provided. Set DATABASE_URL or POSTGRES_DSN, or pass to DB.init_pool().")

        cls._pool = await asyncpg.create_pool(
            dsn=dsn,
            min_size=min_size,
            max_size=max_size,
            # You can tune statement_cache_size, max_inactive_connection_lifetime, etc. here if desired
        )

    @classmethod
    async def close_pool(cls) -> None:
        if cls._pool is not None:
            await cls._pool.close()
            cls._pool = None

    # ---------------------------
    # Query helpers
    # ---------------------------
    @classmethod
    async def fetch_all(cls, sql: str, params: Optional[Sequence[Any]] = None) -> List[Dict[str, Any]]:
        if cls._pool is None:
            raise RuntimeError("DB pool not initialized. Call DB.init_pool() at startup.")
        async with cls._pool.acquire() as conn:
            rows = await conn.fetch(sql, *(params or []))
            return [dict(r) for r in rows]

    @classmethod
    async def fetch_one(cls, sql: str, params: Optional[Sequence[Any]] = None) -> Optional[Dict[str, Any]]:
        if cls._pool is None:
            raise RuntimeError("DB pool not initialized. Call DB.init_pool() at startup.")
        async with cls._pool.acquire() as conn:
            row = await conn.fetchrow(sql, *(params or []))
            return dict(row) if row is not None else None

    @classmethod
    async def execute(cls, sql: str, params: Optional[Sequence[Any]] = None) -> int:
        """
        Execute INSERT/UPDATE/DELETE. Returns affected row count (parsed from command tag).
        """
        if cls._pool is None:
            raise RuntimeError("DB pool not initialized. Call DB.init_pool() at startup.")
        async with cls._pool.acquire() as conn:
            tag = await conn.execute(sql, *(params or []))
            return _parse_rowcount(tag)

    @classmethod
    async def executemany(cls, sql: str, param_sets: Iterable[Sequence[Any]]) -> int:
        """
        Execute the same statement for many parameter sets.
        asyncpg.executemany() returns None; we return the number of batches submitted.
        """
        if cls._pool is None:
            raise RuntimeError("DB pool not initialized. Call DB.init_pool() at startup.")
        batches = list(param_sets)
        if not batches:
            return 0
        async with cls._pool.acquire() as conn:
            await conn.executemany(sql, batches)
        return len(batches)

    # ---------------------------
    # Transactions
    # ---------------------------
    @classmethod
    @asynccontextmanager
    async def transaction(cls):
        """
        Usage:
            async with DB.transaction() as conn:
                await conn.execute("INSERT ... VALUES ($1,$2)", v1, v2)
                rows = await conn.fetch("SELECT ... WHERE col = $1", v1)

        Inside the block, use the connection's own methods:
            - await conn.execute(sql, *args)
            - await conn.fetch(sql, *args)
            - await conn.fetchrow(sql, *args)
        """
        if cls._pool is None:
            raise RuntimeError("DB pool not initialized. Call DB.init_pool() at startup.")
        async with cls._pool.acquire() as conn:
            tx = conn.transaction()
            await tx.start()
            try:
                yield conn
            except Exception:
                await tx.rollback()
                raise
            else:
                await tx.commit()
