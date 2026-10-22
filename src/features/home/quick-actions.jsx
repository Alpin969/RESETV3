"use client";

import { useRouter } from "next/navigation";
import { BedDouble, BellPlus, ChevronRight, PiggyBank, Plus } from "lucide-react";

export default function QuickActions({ onAddTask }) {
  const router = useRouter();

  const actions = [
    {
      icon: Plus,
      label: "Add New Task",
      description: "Create a new task for today",
      onClick: onAddTask,
    },
    {
      icon: BedDouble,
      label: "Log Sleep",
      description: "Record your sleep data",
      onClick: () => router.push("/sleep"),
    },
    {
      icon: PiggyBank,
      label: "Add Savings",
      description: "Track your financial goals",
      onClick: () => router.push("/savings"),
    },
    {
      icon: BellPlus,
      label: "Set Reminder",
      description: "Don't forget important things",
      onClick: () => router.push("/reminders"),
    },
  ];

  return (
    <section className="card flex h-full flex-col p-4 desktop:p-5">
      <div className="mb-1.5 flex items-center justify-between">
        <h2 className="heading-3">Quick Actions</h2>
      </div>
      <div className="flex flex-1 flex-col justify-center divide-y divide-[#eef3ef]">
        {actions.map(({ icon: Icon, label, description, onClick }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            className="group flex w-full items-center gap-3 py-2.5 text-left transition"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-[#e5eee7] bg-[#f5faf6] text-reset-primary transition group-hover:border-[#cfe2d5] group-hover:bg-reset-soft">
              <Icon size={15} strokeWidth={1.9} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] font-semibold text-reset-dark">{label}</span>
              <span className="block truncate text-[10.5px] text-reset-muted">{description}</span>
            </span>
            <ChevronRight size={15} className="shrink-0 text-[#b8c5bb] transition group-hover:translate-x-0.5 group-hover:text-reset-primary" />
          </button>
        ))}
      </div>
    </section>
  );
}
