from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, and_

from app.db.session import get_db
from app.db.models.coin import Coin
from app.db.models.coin_market_snapshot import CoinMarketSnapshot

router = APIRouter(prefix="/coins", tags=["coins"])


@router.get("")
def list_coins(
    limit: int = 20,
    db: Session = Depends(get_db),
):
    """
    Return top coins based on the latest snapshot market_cap (descending).
    """
    # Subquery: latest snapshot timestamp per coin_id
    latest_ts_subq = (
        db.query(
            CoinMarketSnapshot.coin_id.label("coin_id"),
            func.max(CoinMarketSnapshot.ts).label("latest_ts"),
        )
        .group_by(CoinMarketSnapshot.coin_id)
        .subquery()
    )

    # Join coins + latest snapshot per coin
    q = (
        db.query(
            Coin.coingecko_id,
            Coin.symbol,
            Coin.name,
            Coin.image,
            CoinMarketSnapshot.current_price,
            CoinMarketSnapshot.market_cap,
            CoinMarketSnapshot.total_volume,
            CoinMarketSnapshot.price_change_percentage_24h,
            CoinMarketSnapshot.ts.label("snapshot_ts"),
        )
        .join(latest_ts_subq, latest_ts_subq.c.coin_id == Coin.id)
        .join(
            CoinMarketSnapshot,
            and_(
                CoinMarketSnapshot.coin_id == latest_ts_subq.c.coin_id,
                CoinMarketSnapshot.ts == latest_ts_subq.c.latest_ts,
            ),
        )
        .order_by(desc(CoinMarketSnapshot.market_cap))
        .limit(limit)
    )

    rows = q.all()

    # If DB is empty, return [] (no error)
    return [
        {
            "coingecko_id": r.coingecko_id,
            "symbol": r.symbol,
            "name": r.name,
            "image": r.image,
            "current_price": r.current_price,
            "market_cap": r.market_cap,
            "total_volume": r.total_volume,
            "price_change_percentage_24h": r.price_change_percentage_24h,
            "snapshot_ts": r.snapshot_ts,
        }
        for r in rows
    ]


@router.get("/{coingecko_id}/snapshots")
def coin_snapshots(
    coingecko_id: str,
    limit: int = 200,
    db: Session = Depends(get_db),
):
    """
    Return snapshots for a given coin, newest -> oldest.
    """
    coin = db.query(Coin).filter(Coin.coingecko_id == coingecko_id).first()
    if not coin:
        raise HTTPException(status_code=404, detail="Coin not found")

    snaps = (
        db.query(CoinMarketSnapshot)
        .filter(CoinMarketSnapshot.coin_id == coin.id)
        .order_by(desc(CoinMarketSnapshot.ts))
        .limit(limit)
        .all()
    )

    return {
        "coingecko_id": coin.coingecko_id,
        "symbol": coin.symbol,
        "name": coin.name,
        "image": coin.image,
        "snapshots": [
            {
                "ts": s.ts,
                "current_price": s.current_price,
                "market_cap": s.market_cap,
                "total_volume": s.total_volume,
                "price_change_percentage_24h": s.price_change_percentage_24h,
            }
            for s in snaps
        ],
    }
