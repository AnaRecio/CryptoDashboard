export type CoinSnapshot = {
    ts: string; // Timestamp of the snapshot
    current_price: number; // Price of the coin at the timestamp
    market_cap: number; // Market capitalization at the timestamp
    total_volume: number;
    price_change_percentage_24h: number; // 24-hour trading volume at the timestamp
};

export type CoinSnapshotsResponse = {
    coingecko_id: string; // Unique identifier for the coin
    symbol: string; // Symbol of the coin
    name: string; // Name of the coin
    image: string; // URL to the coin's image
    snapshots: CoinSnapshot[]; // Array of coin snapshots
};

const API_BASE_URL = 'http://localhost:8000';

export async function fetchCoinSnapshots(coingeckoId: string, limit= 200) {
    const response = await fetch(`${API_BASE_URL}/coins/${coingeckoId}/snapshots?limit=${limit}`);
    if (!response.ok) {
        throw new Error(`Error fetching coin snapshots: ${response.statusText}`);
    }
    return response.json() as Promise<CoinSnapshotsResponse>;
} 
