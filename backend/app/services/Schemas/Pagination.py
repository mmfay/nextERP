# app/api/common/pagination_schemas.py
from typing import Generic, List, Optional, TypeVar
from pydantic.generics import GenericModel

T = TypeVar("T")

class Page(GenericModel, Generic[T]):
    items: List[T]
    has_next: bool
    next_cursor: Optional[str] = None
    # Optional/defaulted so you don’t have to fill them yet
    has_prev: bool = False
    prev_cursor: Optional[str] = None
    limit: int = 50
