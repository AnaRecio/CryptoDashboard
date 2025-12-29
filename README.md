Crypto Dashboard

Full-stack crypto dashboard application.

Backend: FastAPI + SQLAlchemy + Alembic + PostgreSQL

Frontend: React (Vite) + Recharts

Features

Ingest top market coins from CoinGecko into PostgreSQL

Store coin metadata and time-series price snapshots

View a top market table with prices, market cap, volume, and 24h change

Click a coin to view its historical price chart

Requirements

Python 3.10+

Node.js 18+

PostgreSQL (local)

Backend Setup
1) Create virtual environment and install dependencies

cd backend
python -m venv .venv

Windows:
.venv\Scripts\activate

pip install -r requirements.txt

2) Configure environment variables

Create the file backend/.env:

DATABASE_URL=postgresql+psycopg2://USER:PASSWORD@localhost:5433/crypto_dashboard
CG_API_KEY=YOUR_COINGECKO_KEY

Make sure PostgreSQL is running and the database exists.

3) Run database migrations

alembic upgrade head

4) Run the API server

uvicorn app.main:app --reload

API: http://localhost:8000

API Docs: http://localhost:8000/docs

Frontend Setup
1) Install dependencies

cd frontend
npm install

2) Configure environment variables

Create the file frontend/.env:

VITE_API_BASE_URL=http://localhost:8000

3) Run the frontend

npm run dev

Frontend: http://localhost:5173

Usage

Start the backend server

Start the frontend application

Click Ingest Market Data to store market snapshots

Click any coin in the table to view its price history chart

Notes

.env files are ignored by git and should not be committed

Update the PostgreSQL port in DATABASE_URL if needed