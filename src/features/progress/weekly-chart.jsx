"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { compactDate } from "@/lib/utils/format";

const SHORT_DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function WeeklyChart({ weekly }) {
  const data = weekly.map((p) => ({
    name: SHORT_DAYS[p.day.getDay()],
    full: compactDate(p.day),
    completed: p.completedCount,
    total: p.totalTasks,
  }));
  if (data.length === 0) return <p className="muted mt-3 text-[14px]">Belum ada data untuk ditampilkan.</p>;
  return (
    <div className="mt-4 h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -14 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E4ECE6" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#718176" }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#718176" }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(value, name, props) => [`${props.payload.completed}/${props.payload.total} task`, props.payload.full]}
            contentStyle={{ borderRadius: 12, border: "1px solid #E4ECE6", fontSize: 12 }} />
          <Bar dataKey="completed" fill="#23845B" radius={[7, 7, 3, 3]} maxBarSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-reset-bg px-3 py-3">
      <p className="truncate text-[15px] font-bold text-reset-dark">{value}</p>
      <p className="truncate text-[12px] text-reset-muted">{label}</p>
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
