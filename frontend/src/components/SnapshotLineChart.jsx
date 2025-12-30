import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

function formatUsd(value) {
  const n = Number(value || 0);
  return n >= 1000
    ? `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    : `$${n.toLocaleString(undefined, { maximumFractionDigits: 6 })}`;
}

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function computeDomain(prices) {
  if (!prices.length) return ["auto", "auto"];
  const min = Math.min(...prices);
  const max = Math.max(...prices);


  const range = max - min;
  const pad = range === 0 ? max * 0.01 || 1 : range * 0.12;

  return [min - pad, max + pad];
}

export function SnapshotsLineChart({ snapshots = [] }) {
  const { data, yDomain } = useMemo(() => {
    const ordered = [...snapshots].reverse(); // oldest -> newest

    const points = ordered.map((s) => ({
      t: new Date(s.ts).getTime(), // epoch ms
      price: Number(s.current_price ?? 0),
      ts: s.ts,
    }));

    const prices = points.map((p) => p.price);
    return { data: points, yDomain: computeDomain(prices) };
  }, [snapshots]);

  if (!data.length) return <div style={{ opacity: 0.7 }}>No snapshot data yet.</div>;

  if (data.length < 3) {
    return (
      <div style={{ opacity: 0.8 }}>
        Not enough points to chart nicely yet ({data.length}). Click <b>Ingest Market Data</b> a few times.
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: 340 }}>


      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 18, left: 6, bottom: 10 }}>
          <defs>
            <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopOpacity={0.35} />
              <stop offset="100%" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" opacity={0.25} />

          <XAxis
            dataKey="t"
            type="number"
            scale="time"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(ms) =>
              new Date(ms).toLocaleDateString(undefined, { month: "short", day: "2-digit" })
            }
            tickMargin={10}
            minTickGap={28}
          />

          <YAxis
            domain={yDomain}
            tickFormatter={(v) =>
              Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 2 }).format(v)
            }
            width={70}
          />

          <Tooltip
          labelFormatter={(ms) => new Date(ms).toLocaleString()}
          formatter={(value) => [formatUsd(value), "Price"]}
          contentStyle={{
            background: "rgba(20,20,20,0.92)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            backdropFilter: "blur(8px)",
          }}
          labelStyle={{ color: "rgba(255,255,255,0.7)" }}
        />


          <Area
            type="monotone"
            dataKey="price"
            strokeWidth={2}
            fill="url(#priceFill)"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

