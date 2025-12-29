from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.services.market_service import get_clean_market_coins
from app.db.models import Coin, CoinMarketSnapshot


def ingest_market_data(db: Session) -> dict:
    coins = get_clean_market_coins()
    if not isinstance(coins, list):
        raise ValueError("Expected a list of coins from get_clean_market_coins()")

    ts = datetime.now(timezone.utc)

    inserted_snapshots = 0

    for c in coins:
        coingecko_id = c.get("coingecko_id")
        if not coingecko_id:
            continue

        # Upsert-ish: find by coingecko_id, else create
        coin = db.query(Coin).filter(Coin.coingecko_id == coingecko_id).first()
        if coin is None:
            coin = Coin(coingecko_id=coingecko_id)

        coin.symbol = c.get("symbol")
        coin.name = c.get("name")
        coin.image = c.get("image")

        db.add(coin)
        db.flush()  # ensures coin.id is available (even before commit)

        snapshot = CoinMarketSnapshot(
            coin_id=coin.id,
            ts=ts,
            current_price=c.get("current_price"),
            market_cap=c.get("market_cap"),
            total_volume=c.get("total_volume"),
            price_change_percentage_24h=c.get("price_change_percentage_24h"),
        )
        db.add(snapshot)
        inserted_snapshots += 1

    db.commit()

    return {
        "coins_received": len(coins),
        "snapshots_inserted": inserted_snapshots,
        "ts": ts.isoformat(),
    }
