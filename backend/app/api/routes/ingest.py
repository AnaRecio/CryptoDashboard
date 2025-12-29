from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.ingestion_service import ingest_market_data

router = APIRouter(prefix="/ingest", tags=["Ingest"])

@router.post("/market")
def ingest_market(db: Session = Depends(get_db)):
    return ingest_market_data(db)