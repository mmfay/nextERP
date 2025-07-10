from fastapi import APIRouter
from .service import get_trial_balance

router = APIRouter()

@router.get("/")
def trial_balance():
    return get_trial_balance()