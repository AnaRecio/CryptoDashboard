from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

from app.db.session import get_db
from app.services.ingestion_service import ingest_market_data

from app.api.routes.market import router as market_router
from app.api.routes.coins import router as coins_router
from app.api.routes.ingest import router as ingest_market

app = FastAPI(title="Crypto Dashboard API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers de lectura
app.include_router(ingest_market)
app.include_router(market_router)
app.include_router(coins_router)

# Router/endpoint de ingestion
@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}
