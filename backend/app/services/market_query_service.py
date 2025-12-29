from sqlalchemy.orm import Session
from sqlalchemy import text

def get_top_market(db: Session, limit: int = 20):
    sql = text("""
        SELECT DISTINCT ON (c.id)
          c.coingecko_id, c.symbol, c.name, c.image,
          s.ts, s.current_price, s.market_cap, s.total_volume, s.price_change_percentage_24h
        FROM coins c
        JOIN coin_market_snapshots s ON s.coin_id = c.id
        ORDER BY c.id, s.ts DESC
        LIMIT :limit;
    """)
    rows = db.execute(sql, {"limit": limit}).mappings().all()
    return [dict(r) for r in rows]
