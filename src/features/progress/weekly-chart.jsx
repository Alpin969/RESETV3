"use client";

import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis } from "recharts";

export default function WeeklyChart({ weekly }) {
  if (!weekly || weekly.length === 0) {
    return (
      <div className="flex h-full min-h-44 items-center justify-center">
        <p className="body-md text-reset-muted">No data to display</p>
      </div>
    );
  }

  const data = weekly.map((point) => {
    const percent = point.total > 0 ? Math.round((point.completed / point.total) * 100) : 0;
    return {
      name: point.name,
      completed: point.completed,
      total: point.total,
      percent,
    };
  });

  return (
    <div className="h-full min-h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 24, right: 2, bottom: 0, left: 2 }} barCategoryGap="28%">
          <CartesianGrid strokeDasharray="3 6" stroke="#edf2ee" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10.5, fill: "#8a9b8f", fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
            tickMargin={8}
          />
          <Tooltip
            cursor={{ fill: "rgba(47,138,96,0.04)", radius: 8 }}
            formatter={(_value, _name, item) => [`${item?.payload?.completed ?? 0}/${item?.payload?.total ?? 0} tasks`, item?.payload?.name ?? ""]}
            contentStyle={{
              borderRadius: 10,
              border: "1px solid #e2ebe4",
              fontSize: 11.5,
              background: "white",
              boxShadow: "0 8px 24px rgba(25, 61, 45, 0.1)",
            }}
            labelStyle={{ color: "#1d3a2a", fontWeight: 700 }}
          />
          <Bar dataKey="percent" fill="#2f8a60" radius={[5, 5, 2, 2]} maxBarSize={30}>
            <LabelList
              dataKey="percent"
              position="top"
              formatter={(value) => `${value}%`}
              style={{ fontSize: 9.5, fill: "#5d7566", fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MiniStat({ label, value }) {
  return (
    <div className="min-w-0 rounded-[10px] border border-[#edf2ee] bg-[#fbfdfb] px-2.5 py-2.5">
      <p className="truncate text-[14px] font-bold leading-tight text-reset-dark">{value}</p>
      <p className="mt-0.5 truncate text-[10px] font-medium text-reset-muted">{label}</p>
    </div>
  );
}

export function formatMinutesId(minutes) {
  const total = Math.max(0, Math.round(minutes || 0));
  if (total <= 0) return "—";
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} menit`;
  if (m === 0) return `${h} jam`;
  return `${h} jam ${m} menit`;
}
