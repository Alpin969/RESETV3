"use client";

import { useRouter } from "next/navigation";
import { BedDouble, PiggyBank, TrendingUp, BellPlus } from "lucide-react";

const ACTIONS = [
  { icon: BedDouble, label: "Sleep", href: "/sleep" },
  { icon: PiggyBank, label: "Savings", href: "/savings" },
  { icon: TrendingUp, label: "View Progress", href: "/progress" },
  { icon: BellPlus, label: "Add Reminder", href: "/reminders" },
];

export default function QuickActions({ compact }) {
  const router = useRouter();
  return (
    <section>
      <h2 className="text-[17px] font-bold text-reset-dark">Quick Actions</h2>
      <div className={`mt-3 grid gap-3 ${compact ? "grid-cols-2" : "grid-cols-2 tablet:grid-cols-4"}`}>
        {ACTIONS.map(({ icon: Icon, label, href }) => (
          <button key={label} type="button" onClick={() => router.push(href)}
            className="flex items-center gap-2.5 rounded-2xl border border-reset-border bg-white px-3.5 py-3.5 text-left transition hover:border-reset-primary/40 hover:bg-[#FAFCFA] active:scale-[0.98]">
            <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-reset-soft text-reset-primary">
              <Icon size={18} />
            </span>
            <span className="min-w-0 flex-1 text-[13.5px] font-semibold leading-4 text-reset-dark">{label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
