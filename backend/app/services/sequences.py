from app.data.shared.in_memory_store import _sequence_store, _record_store

def get_next_id(prefix: str, width: int = 6) -> str:
    """
    Generic sequence generator.
    - prefix: e.g. "GJ", "PO", etc.
    - width: zero-pad length (default 6 digits).
    """
    _sequence_store[prefix] = _sequence_store.get(prefix, 0) + 1
    num = _sequence_store[prefix]
    return f"{prefix}-{num:0{width}d}"

def get_next_record(table: str) -> int:
    """
    Generic record ID generator for tables like 'warehouse', 'item', etc.
    """
    _record_store[table] = _record_store.get(table, 0) + 1
    return _record_store[table]