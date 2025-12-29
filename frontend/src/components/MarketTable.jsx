import React from "react";

function fmtMoney(n) {
  return "$" + Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function fmtPct(n) {
  const v = Number(n ?? 0);
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}%`;
}

export function MarketTable({ coins, onSelectCoin, selectedId }) {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
        overflow: "hidden",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <table width="100%" cellPadding="12" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr
            style={{
              textAlign: "left",
              background: "rgba(255,255,255,0.04)",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <th>Coin</th>
            <th>Price</th>
            <th>Market Cap</th>
            <th>Volume</th>
            <th>24h %</th>
          </tr>
        </thead>

        <tbody>
          {coins.map((c) => {
            const isSelected = selectedId === c.coingecko_id;
            const pct = Number(c.price_change_percentage_24h ?? 0);

            return (
              <tr
                key={c.coingecko_id}
                onClick={() => onSelectCoin(c)}
                title="Click to view snapshots"
                style={{
                  cursor: "pointer",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  background: isSelected ? "rgba(255,255,255,0.06)" : "transparent",
                }}
              >
                <td style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <img
                    src={c.image}
                    alt={c.name}
                    width="26"
                    height="26"
                    style={{ borderRadius: 999, background: "rgba(255,255,255,0.06)" }}
                  />
                  <div>
                    <div style={{ fontWeight: 650 }}>{c.name}</div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>{c.symbol?.toUpperCase()}</div>
                  </div>
                </td>

                <td>{fmtMoney(c.current_price)}</td>
                <td>{fmtMoney(c.market_cap)}</td>
                <td>{fmtMoney(c.total_volume)}</td>

                <td style={{ fontWeight: 600, opacity: 0.95 }}>
                  <span style={{ opacity: 0.9 }}>
                    {fmtPct(pct)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
