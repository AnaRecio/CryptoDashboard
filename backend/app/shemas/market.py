from datetime import datetime
from pydantic import BaseModel, ConfigDict

class MarketCoinOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    coingecko_id: str
    symbol: str | None
    name: str | None
    image: str | None
    current_price: float | None = None
    market_cap: float | None = None
    total_volume: float | None = None
    price_change_percentage_24h: float | None = None
    ts: datetime | None = None
