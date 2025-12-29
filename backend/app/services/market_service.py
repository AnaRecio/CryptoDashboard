from ..providers.coingecko import get_top_market_coins


def get_clean_market_coins():
    raw_data = get_top_market_coins()
    cleaned_data = []
    for coin in raw_data:
        cleaned_coin = {
            'coingecko_id': coin.get('id', None),
            'symbol': coin.get('symbol', None),
            'name': coin.get('name', None),
            'current_price': coin.get('current_price', None),
            'market_cap': coin.get('market_cap', None),
            'total_volume': coin.get('total_volume', None),
            'price_change_percentage_24h': coin.get('price_change_percentage_24h', None),
            'image': coin.get('image', None)
        }
        cleaned_data.append(cleaned_coin)
    return cleaned_data
