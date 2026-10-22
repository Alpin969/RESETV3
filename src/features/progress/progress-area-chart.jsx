"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

export default function ProgressAreaChart({ data, id = "progress", compact = false }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full min-h-32 items-center justify-center">
        <p className="text-[12px] text-reset-muted">Not enough data yet</p>
      </div>
    );
  }

  const interval = data.length > 12 ? Math.ceil(data.length / 6) - 1 : 0;

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2f8a60" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#2f8a60" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            interval={interval}
            tick={{ fontSize: compact ? 9 : 10, fill: "#93a497" }}
            axisLine={false}
            tickLine={false}
            tickMargin={8}
          />
          <Tooltip
            cursor={{ stroke: "#b9d9c6", strokeWidth: 1, strokeDasharray: "4 4" }}
            formatter={(value) => [`${value}%`, "Completion"]}
            contentStyle={{
              borderRadius: 10,
              border: "1px solid #e2ebe4",
              fontSize: 11.5,
              background: "white",
              boxShadow: "0 8px 24px rgba(25, 61, 45, 0.1)",
            }}
            labelStyle={{ color: "#1d3a2a", fontWeight: 700 }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#2f8a60"
            strokeWidth={2}
            fill={`url(#${id}-fill)`}
            dot={data.length <= 12 ? { r: 2.5, fill: "#2f8a60", stroke: "#fff", strokeWidth: 1.5 } : false}
            activeDot={{ r: 4, fill: "#2f8a60", stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
