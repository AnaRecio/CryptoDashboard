# Crypto Dashboard

A full-stack cryptocurrency dashboard for ingesting, storing, and visualizing real-time market data.

---

## Tech Stack

Backend:
- FastAPI
- SQLAlchemy
- Alembic
- PostgreSQL
- CoinGecko API

Frontend:
- React (Vite)
- Recharts
- JavaScript / TypeScript

---

## Features

- Ingest top market coins from CoinGecko into PostgreSQL
- Store coin metadata and time-series price snapshots
- View a top market table with prices, market cap, volume, and 24h change
- Click any coin to view its historical price chart

---

## Requirements

- Python 3.10+
- Node.js 18+
- PostgreSQL (local)

---

## Backend Setup

Create a virtual environment and install dependencies:

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment (Windows):

```bash
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create the environment file `backend/.env`:

```env
DATABASE_URL=postgresql+psycopg2://USER:PASSWORD@localhost:5433/crypto_dashboard
CG_API_KEY=YOUR_COINGECKO_KEY
```

Make sure PostgreSQL is running and the database exists.

Run database migrations:

```bash
alembic upgrade head
```

Run the API server:

```bash
uvicorn app.main:app --reload
```

API:
- http://localhost:8000  
- Docs: http://localhost:8000/docs  

---

## Frontend Setup

Install dependencies:

```bash
cd frontend
npm install
```

Create the environment file `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Run the frontend:

```bash
npm run dev
```

Frontend:
- http://localhost:5173  

---

## ▶Usage

1. Start the backend server
2. Start the frontend application
3. Click **Ingest Market Data** to store market snapshots
4. Click any coin in the table to view its price history chart

---

##  Notes

- `.env` files are ignored by git and must not be committed
- Update the PostgreSQL port in `DATABASE_URL` if needed
- This project is intended for local development but is production-ready

---

##  Author

Built as a full-stack learning and portfolio project.
