# app/services/pagination.py
from typing import Optional, List, Any, Dict

def fetch_page_cursor(
    *,
    table: str,
    order_columns: List[str],
    select_columns: str,
    limit: int,
    after_values: Optional[List[Any]] = None,
    before_values: Optional[List[Any]] = None,
    row_mapper=lambda row: row
) -> Dict[str, Any]:
    """
    Generic keyset pagination over any table.
    order_columns: columns in ORDER BY, in the same tuple order for the WHERE.
    select_columns: SQL snippet for SELECT list.
    after_values: list of values for 'after' cursor (same order as order_columns)
    before_values: list of values for 'before' cursor (same order as order_columns)
    """
    from app.classes.DataBaseConnection import DB

    params: List[Any] = []
    where = ""
    forward = bool(after_values)
    backward = bool(before_values)

    if forward:
        tuple_cols = ", ".join(order_columns)
        placeholders = ", ".join(["%s"] * len(after_values))
        where = f"WHERE ({tuple_cols}) < ({placeholders})"
        params.extend(after_values)
        order_by = "ORDER BY " + ", ".join(order_columns) + " DESC"
    elif backward:
        tuple_cols = ", ".join(order_columns)
        placeholders = ", ".join(["%s"] * len(before_values))
        where = f"WHERE ({tuple_cols}) > ({placeholders})"
        params.extend(before_values)
        order_by = "ORDER BY " + ", ".join(order_columns) + " DESC"
    else:
        order_by = "ORDER BY " + ", ".join(order_columns) + " DESC"

    sql = f"""
        SELECT {select_columns}
        FROM {table}
        {where}
        {order_by}
        LIMIT %s;
    """
    params.append(limit + 1)

    rows = DB.fetch_all(sql, tuple(params))
    got_extra = len(rows) > limit
    if got_extra:
        rows = rows[:limit]

    if backward:
        rows = list(reversed(rows))

    items = [row_mapper(r) for r in rows]

    has_next = has_prev = False
    next_cursor = prev_cursor = None

    if items:
        first = rows[0]
        last = rows[-1]
        if forward:
            has_next = got_extra
            has_prev = True
        elif backward:
            has_prev = got_extra
            has_next = True
        else:
            has_next = got_extra
            has_prev = False

        if has_next:
            next_cursor = {col: last[col] for col in order_columns}
        if has_prev:
            prev_cursor = {col: first[col] for col in order_columns}

    return {
        "items": items,
        "has_next": has_next,
        "has_prev": has_prev,
        "next_cursor": next_cursor,
        "prev_cursor": prev_cursor,
        "limit": limit,
    }
