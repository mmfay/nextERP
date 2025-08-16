# app/services/cursor.py
import base64, json
from typing import Any, Dict, Optional

def encode_cursor(d: Dict[str, Any]) -> str:
    return base64.urlsafe_b64encode(json.dumps(d, default=str).encode()).decode()

def decode_cursor(token: Optional[str]) -> Dict[str, Any]:
    if not token:
        return {}
    return json.loads(base64.urlsafe_b64decode(token.encode()).decode())
