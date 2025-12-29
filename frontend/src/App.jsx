import { useEffect, useState } from "react";
import { api } from "./api";
import { MarketTable } from "./components/MarketTable";
import { SnapshotsLineChart } from "./components/SnapshotLineChart";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [coins, setCoins] = useState([]);
  const [error, setError] = useState("");
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [snapshots, setSnapshots] = useState([]);

  async function loadTop() {
    setLoading(true);
    setError("");
    try {
      const data = await api.topMarket(20);
      setCoins(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function ingest() {
    setLoading(true);
    setError("");
    try {
      await api.ingestMarket();
      await loadTop();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function openCoin(coin) {
    setSelectedCoin(coin);
    setLoading(true);
    setError("");
    try {
      const data = await api.coinSnapshot(coin.coingecko_id, 100);
      setSnapshots(data.snapshots || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTop();
  }, []);

  return (
    <div style={{ fontFamily: "system-ui", padding: 16, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 12 }}>Crypto Dashboard</h1>

      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <button onClick={loadTop} disabled={loading}>
          Refresh Top Market
        </button>
        <button onClick={ingest} disabled={loading}>
          Ingest Market Data
        </button>
      </div>

      {error && (
        <div style={{ background: "#ffe5e5", padding: 12, borderRadius: 8, marginBottom: 12 }}>
          {error}
        </div>
      )}

      {loading && <div style={{ marginBottom: 12 }}>Loading...</div>}

      <MarketTable
        coins={coins}
        selectedId={selectedCoin?.coingecko_id}
        onSelectCoin={openCoin}
      />

      {selectedCoin && (
        <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <h2 style={{ margin: 0 }}>
              {selectedCoin.name} ({selectedCoin.symbol?.toUpperCase()})
            </h2>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              {snapshots.length} snapshots
            </div>
          </div>

          <SnapshotsLineChart snapshots={snapshots} />
        </div>
      )}
    </div>
  );
}

