import { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import { MarketTable } from "./components/MarketTable";
import { SnapshotsLineChart } from "./components/SnapshotLineChart";

const RANGE_OPTIONS = [
  { key: "24H", label: "24H", hours: 24 },
  { key: "7D", label: "7D", hours: 24 * 7 },
  { key: "30D", label: "30D", hours: 24 * 30 },
  { key: "ALL", label: "ALL", hours: null },
];

export default function App() {
  const [loading, setLoading] = useState(false);
  const [coins, setCoins] = useState([]);
  const [error, setError] = useState("");
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [rangeKey, setRangeKey] = useState("7D");

  async function loadTop() {
    setLoading(true);
    setError("");
    try {
      const data = await api.topMarket(20);
      setCoins(data);
    } catch (e) {
      setError(e?.message || "Failed to load market data.");
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
      // optional: refresh selected coin snapshots after ingest
      if (selectedCoin?.coingecko_id) {
        const data = await api.coinSnapshot(selectedCoin.coingecko_id, 200);
        setSnapshots(data.snapshots || []);
      }
    } catch (e) {
      setError(e?.message || "Failed to ingest market data.");
    } finally {
      setLoading(false);
    }
  }

  async function openCoin(coin) {
    setSelectedCoin(coin);
    setRangeKey("7D");
    setLoading(true);
    setError("");
    try {
      // 200 gives more room for 30D/ALL filters if your backend stores enough
      const data = await api.coinSnapshot(coin.coingecko_id, 200);
      setSnapshots(data.snapshots || []);
    } catch (e) {
      setError(e?.message || "Failed to load snapshots.");
      setSnapshots([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTop();
  }, []);

  const filteredSnapshots = useMemo(() => {
    if (!snapshots?.length) return [];
    const opt = RANGE_OPTIONS.find((o) => o.key === rangeKey);
    if (!opt || opt.hours == null) return snapshots;

    const now = Date.now();
    const cutoff = now - opt.hours * 60 * 60 * 1000;

    // keep only those inside the time window
    const within = snapshots.filter((s) => {
      const t = new Date(s.ts).getTime();
      return !Number.isNaN(t) && t >= cutoff;
    });

    // If user clicks 24H/7D/30D but we only have older data, return empty
    return within;
  }, [snapshots, rangeKey]);

  const lastPrice = useMemo(() => {
    if (!filteredSnapshots?.length) return null;
    // backend usually returns newest first; take first
    return filteredSnapshots[0]?.current_price ?? null;
  }, [filteredSnapshots]);

  const selectedMeta = useMemo(() => {
    if (!selectedCoin) return null;
    return {
      name: selectedCoin.name,
      symbol: selectedCoin.symbol?.toUpperCase?.() || "",
      image: selectedCoin.image,
    };
  }, [selectedCoin]);

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        background: "radial-gradient(1200px 600px at 20% 0%, #2a2a2a 0%, #171717 60%, #111 100%)",
        color: "rgba(255,255,255,0.92)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "100%",
          padding: "28px 24px",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            width: "100%",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 16
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 56, letterSpacing: -1 }}>
              Crypto Dashboard
            </h1>
            <div style={{ marginTop: 6, opacity: 0.7, fontSize: 14 }}>
              Top market view + historical snapshots from your FastAPI backend
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <ActionButton onClick={loadTop} disabled={loading}>
              Refresh Top Market
            </ActionButton>
            <ActionButton onClick={ingest} disabled={loading} variant="primary">
              Ingest Market Data
            </ActionButton>
          </div>
        </div>

        {/* Error / Loading */}
        {error && (
          <div
            style={{
              background: "rgba(255, 80, 80, 0.12)",
              border: "1px solid rgba(255, 80, 80, 0.25)",
              padding: 12,
              borderRadius: 12,
              marginBottom: 14,
              color: "rgba(255,255,255,0.92)",
            }}
          >
            {error}
          </div>
        )}

        {loading && (
          <div style={{ marginBottom: 14, opacity: 0.8 }}>
            Loading...
          </div>
        )}

        {/* Main layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: selectedCoin ? "1.1fr 0.9fr" : "1fr",
            gap: 14,
            alignItems: "start",
          }}
        >
          {/* Left: Table */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Top Market</div>
              <div style={{ fontSize: 12, opacity: 0.65 }}>
                Click a coin to view snapshots
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <MarketTable
                coins={coins}
                selectedId={selectedCoin?.coingecko_id}
                onSelectCoin={openCoin}
              />
            </div>
          </Card>

          {/* Right: Details + Chart */}
          {selectedCoin && (
            <Card>
              <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  {selectedMeta?.image && (
                    <img
                      src={selectedMeta.image}
                      alt={selectedMeta.name}
                      width={44}
                      height={44}
                      style={{ borderRadius: 12 }}
                    />
                  )}
                  <div>
                    <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: -0.5 }}>
                      {selectedMeta?.name}{" "}
                      <span style={{ opacity: 0.8 }}>
                        ({selectedMeta?.symbol})
                      </span>
                    </div>
                    <div style={{ marginTop: 4, fontSize: 13, opacity: 0.7 }}>
                      Showing {filteredSnapshots.length} snapshots
                      {lastPrice != null ? (
                        <>
                          {" • "}
                          Latest:{" "}
                          <span style={{ fontWeight: 700, opacity: 0.95 }}>
                            ${Number(lastPrice).toLocaleString()}
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Range pills */}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {RANGE_OPTIONS.map((opt) => (
                    <Pill
                      key={opt.key}
                      active={rangeKey === opt.key}
                      onClick={() => setRangeKey(opt.key)}
                    >
                      {opt.label}
                    </Pill>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                {filteredSnapshots.length === 0 ? (
                  <EmptyState
                    title="No snapshots for this range"
                    subtitle="Try 7D, 30D, or ALL. Also make sure you have ingested enough data over time."
                  />
                ) : (
                  <div
                    style={{
                      borderRadius: 18,
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(0,0,0,0.18)",
                      padding: 14,
                    }}
                  >
                    <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10, opacity: 0.9 }}>
                      Price snapshots
                    </div>

                    <SnapshotsLineChart snapshots={filteredSnapshots} />
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Footer note */}
      </div>
    </div>
  );
}

/* --------------------------- small UI helpers --------------------------- */

function Card({ children }) {
  return (
    <div
      style={{
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.06)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        padding: 16,
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}

function ActionButton({ children, onClick, disabled, variant }) {
  const isPrimary = variant === "primary";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        cursor: disabled ? "not-allowed" : "pointer",
        padding: "12px 16px",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.10)",
        background: isPrimary
          ? "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))"
          : "rgba(0,0,0,0.25)",
        color: "rgba(255,255,255,0.92)",
        fontWeight: 700,
        letterSpacing: 0.2,
        boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  );
}

function Pill({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        cursor: "pointer",
        padding: "10px 14px",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.10)",
        background: active ? "rgba(255,255,255,0.92)" : "rgba(0,0,0,0.25)",
        color: active ? "#111" : "rgba(255,255,255,0.92)",
        fontWeight: 800,
        minWidth: 62,
        boxShadow: active ? "0 10px 24px rgba(0,0,0,0.25)" : "none",
      }}
    >
      {children}
    </button>
  );
}

function EmptyState({ title, subtitle }) {
  return (
    <div
      style={{
        borderRadius: 18,
        border: "1px dashed rgba(255,255,255,0.14)",
        background: "rgba(0,0,0,0.18)",
        padding: 16,
      }}
    >
      <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>
        {title}
      </div>
      <div style={{ opacity: 0.7, fontSize: 13 }}>{subtitle}</div>
    </div>
  );
}
