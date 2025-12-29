import requests
import os
from dotenv import load_dotenv
load_dotenv()

CG_API_KEY = os.getenv('CG_API_KEY')
url = 'https://api.coingecko.com/api/v3/' 

headers = { 'x-cg-demo-api-key': CG_API_KEY }

def get_prices(coin_ids: list, currency: str) -> dict:
    endpoint = f"{url}simple/price"
    params = {
        'ids': ','.join(coin_ids),
        'vs_currencies': currency
    }

    response = requests.get(endpoint, headers=headers, params=params)
    data = response.json()
    return data 

def get_top_market_coins() -> dict:
    endpoint = f"{url}coins/markets"

    params = {
        'vs_currency': 'usd',
    }

    response = requests.get(endpoint, headers=headers, params=params)
    data = response.json()
    return data

