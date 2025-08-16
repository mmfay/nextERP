# app/db.py
from __future__ import annotations
import os
from contextlib import contextmanager
from typing import Any, Iterable, Optional, Sequence

import psycopg
from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool


class DB:
    """
    Lightweight Postgres access layer with pooling.
    Usage:
        rows = DB.fetch_all("SELECT * FROM mytable WHERE col = %s", [val])
    """

    _pool: Optional[ConnectionPool] = None

    @classmethod
    def init_pool(cls, dsn: Optional[str] = None, min_size: int = 1, max_size: int = 10) -> None:
        """
        Initialize a global connection pool. Call once on app startup.
        DSN can be a URL or a space-separated string.
        """
        if cls._pool is not None:
            return

        dsn = dsn or os.getenv("DATABASE_URL") or os.getenv("POSTGRES_DSN")
        if not dsn:
            raise RuntimeError("No DSN provided. Set DATABASE_URL or POSTGRES_DSN, or pass to DB.init_pool().")

        cls._pool = ConnectionPool(
            conninfo=dsn,
            min_size=min_size,
            max_size=max_size,
            kwargs={"row_factory": dict_row},  # every cursor returns dicts
        )

    @classmethod
    @contextmanager
    def _get_conn(cls):
        if cls._pool is None:
            raise RuntimeError("DB pool not initialized. Call DB.init_pool() at startup.")
        with cls._pool.connection() as conn:
            yield conn

    # ---------------------------
    # Query helpers
    # ---------------------------
    @classmethod
    def fetch_all(cls, sql: str, params: Optional[Sequence[Any]] = None) -> list[dict[str, Any]]:
        with cls._get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(sql, params or [])
                return list(cur.fetchall())

    @classmethod
    def fetch_one(cls, sql: str, params: Optional[Sequence[Any]] = None) -> Optional[dict[str, Any]]:
        with cls._get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(sql, params or [])
                row = cur.fetchone()
                return dict(row) if row is not None else None

    @classmethod
    def execute(cls, sql: str, params: Optional[Sequence[Any]] = None) -> int:
        """
        Execute INSERT/UPDATE/DELETE. Returns affected row count.
        """
        with cls._get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(sql, params or [])
                return cur.rowcount

    @classmethod
    def executemany(cls, sql: str, param_sets: Iterable[Sequence[Any]]) -> int:
        with cls._get_conn() as conn:
            with conn.cursor() as cur:
                cur.executemany(sql, param_sets)
                return cur.rowcount

    # ---------------------------
    # Transactions
    # ---------------------------
    @classmethod
    @contextmanager
    def transaction(cls):
        """
        Usage:
            with DB.transaction() as cur:
                cur.execute("INSERT ...", [...])
                cur.execute("UPDATE ...", [...])
        """
        if cls._pool is None:
            raise RuntimeError("DB pool not initialized. Call DB.init_pool().")

        with cls._pool.connection() as conn:
            try:
                with conn.cursor() as cur:
                    yield cur
                conn.commit()
            except Exception:
                conn.rollback()
                raise
