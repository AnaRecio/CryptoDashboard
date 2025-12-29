import os
import psycopg2
from psycopg2.extras import execute_batch
from dotenv import load_dotenv
from ..services.market_service import get_clean_market_coins
from datetime import datetime, timezone

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')

def get_conn():
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL is not set in environment variables.")
    return psycopg2.connect(DATABASE_URL)

UPSERT_COIN_SQL = """
INSERT INTO coins (coingecko_id, symbol, name, image, updated_at)
VALUES (%s, %s, %s, %s, NOW())
ON CONFLICT (coingecko_id) DO UPDATE SET
  symbol = EXCLUDED.symbol,
  name = EXCLUDED.name,
  image = EXCLUDED.image,
  updated_at = NOW()
RETURNING id;
"""

INSERT_SNAPSHOT_SQL = """
INSERT INTO coin_market_snapshots (
  coin_id, ts, current_price, market_cap, total_volume, price_change_percentage_24h
)
VALUES (%s, %s, %s, %s, %s, %s);
"""

def ingest_market_data():
    coins = get_clean_market_coins()
    if not isinstance(coins, list):
        raise ValueError("Expected a list of coins from get_clean_market_coins()")
    
    ts =datetime.now(timezone.utc)

    with get_conn() as conn:
        with conn.cursor() as cur:
            snapshots_to_insert = []
            for coin in coins:
                coingecko_id = coin['coingecko_id']
                if not coingecko_id:
                    continue

                cur.execute(UPSERT_COIN_SQL, (
                    coingecko_id,
                    coin['symbol'],
                    coin['name'],
                    coin['image']
                ))
                coin_id = cur.fetchone()[0]

                snapshots_to_insert.append((
                    coin_id,
                    ts,
                    coin['current_price'],
                    coin['market_cap'],
                    coin['total_volume'],
                    coin['price_change_percentage_24h']
                ))

            execute_batch(cur, INSERT_SNAPSHOT_SQL, snapshots_to_insert)
    return(f"Ingested market data for {len(coins)} coins.")

