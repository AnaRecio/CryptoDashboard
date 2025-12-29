import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

function compact(n) {
  return Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 2 }).format(Number(n ?? 0));
}

function money(n) {
  return Intl.NumberFormat(undefined, { maximumFractionDigits: 6 }).format(Number(n ?? 0));
}

function formatX(ts, withDate) {
  const d = new Date(ts);
  return withDate
    ? d.toLocaleDateString(undefined, { month: "short", day: "2-digit" })
    : d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export function SnapshotsLineChart({ snapshots }) {
  const data = useMemo(() => {
    if (!snapshots?.length) return [];

    const ordered = [...snapshots].slice().reverse(); // oldest -> newest

    const first = new Date(ordered[0].ts);
    const last = new Date(ordered[ordered.length - 1].ts);
    const withDate = first.toDateString() !== last.toDateString();

    return ordered.map((s) => ({
      ts: s.ts,
      x: formatX(s.ts, withDate),
      price: Number(s.current_price ?? 0),
    }));
  }, [snapshots]);

  if (!data.length) {
    return (
      <div style={{ opacity: 0.7, padding: 12 }}>
        No snapshot data yet. Run ingestion and try again.
      </div>
    );
  }

  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
        padding: 12,
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <div style={{ fontWeight: 650, marginBottom: 8, opacity: 0.9 }}>Price snapshots</div>

      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 16, left: 6, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
            <XAxis
              dataKey="x"
              interval="preserveStartEnd"
              tickMargin={8}
              tick={{ fontSize: 12, opacity: 0.75 }}
            />
            <YAxis
              tickFormatter={compact}
              width={70}
              tick={{ fontSize: 12, opacity: 0.75 }}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(20,20,20,0.95)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 10,
              }}
              labelStyle={{ opacity: 0.75 }}
              formatter={(value) => [`$${money(value)}`, "Price"]}
            />
            <Line type="monotone" dataKey="price" dot={false} strokeWidth={2.5} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
