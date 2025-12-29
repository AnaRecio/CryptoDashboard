from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.market_query_service import get_top_market
from app.shemas.market import MarketCoinOut

router = APIRouter(prefix="/market", tags=["market"])

@router.get("/top", response_model=List[MarketCoinOut])
def market_top(
    limit: int = Query(20, ge=1, le=200),
    db: Session = Depends(get_db),
):
    return get_top_market(db, limit=limit)
