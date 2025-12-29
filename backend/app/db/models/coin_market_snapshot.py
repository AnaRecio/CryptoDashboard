from sqlalchemy import ForeignKey, DateTime, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class CoinMarketSnapshot(Base):
    __tablename__ = "coin_market_snapshots"

    id: Mapped[int] = mapped_column(primary_key=True)

    coin_id: Mapped[int] = mapped_column(ForeignKey("coins.id"), index=True, nullable=False)
    ts: Mapped[DateTime] = mapped_column(DateTime(timezone=True), index=True, nullable=False)

    current_price: Mapped[float | None] = mapped_column(Numeric(20, 8), nullable=True)
    market_cap: Mapped[float | None] = mapped_column(Numeric(30, 2), nullable=True)
    total_volume: Mapped[float | None] = mapped_column(Numeric(30, 2), nullable=True)
    price_change_percentage_24h: Mapped[float | None] = mapped_column(Numeric(10, 4), nullable=True)

    coin = relationship("Coin", back_populates="snapshots")
