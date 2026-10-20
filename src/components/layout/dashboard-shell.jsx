"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  House,
  Leaf,
  Settings,
  TrendingUp,
} from "lucide-react";
import { DASHBOARD_NAV } from "@/lib/constants/navigation";
import { useAuth } from "@/features/auth/auth-provider";
import { cn } from "@/lib/utils/cn";
import { truncate } from "@/lib/utils/format";
import Avatar from "@/components/ui/avatar";

const ICONS = {
  home: House,
  history: CalendarDays,
  progress: TrendingUp,
  settings: Settings,
};

export default function DashboardShell({ children }) {
  const pathname = usePathname();
  const { profile, user } = useAuth();
  const activeTab = DASHBOARD_NAV.find((item) => item.href === pathname)?.href
    || (pathname?.startsWith("/home") ? "/home" : null);

  const username = profile?.username || user?.email?.split("@")[0] || "Friend";
  const email = user?.email || "";

  return (
    <div className="min-h-dvh bg-reset-bg">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[88px] flex-col border-r border-[#E7EDE8] bg-[#FAFCFA] tablet:flex min-[840px]:w-[236px]">
        <Link
          href="/home"
          className="flex h-[88px] items-center justify-center gap-2.5 px-4 min-[840px]:justify-start min-[840px]:px-6"
        >
          <Leaf size={28} strokeWidth={1.8} className="shrink-0 text-reset-primary" />
          <span className="hidden text-[24px] font-extrabold tracking-[-0.9px] text-[#14251C] min-[840px]:inline">
            RESET.
          </span>
        </Link>

        <nav className="flex flex-col gap-1.5 px-3 min-[840px]:px-4">
          {DASHBOARD_NAV.map((item) => {
            const Icon = ICONS[item.icon];
            const active = activeTab === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-12 items-center justify-center gap-3 rounded-[14px] px-3 text-[14.5px] font-semibold transition-colors min-[840px]:justify-start min-[840px]:px-4",
                  active
                    ? "bg-reset-soft text-reset-primary"
                    : "text-reset-muted hover:bg-white hover:text-reset-dark"
                )}
              >
                <Icon size={21} strokeWidth={active ? 2.2 : 1.9} />
                <span className="hidden min-[840px]:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-[#E7EDE8] px-3 py-4 min-[840px]:px-4">
          <div className="flex items-center justify-center gap-2.5 min-[840px]:justify-start">
            <Link
              href="/settings"
              className="flex min-w-0 items-center gap-2.5 rounded-xl p-1 transition hover:bg-white min-[840px]:flex-1"
              title="Pengaturan profil"
            >
              <Avatar
                src={profile?.avatar_url}
                name={username}
                size={40}
              />
              <span className="hidden min-w-0 min-[840px]:block">
                <span className="block truncate text-[13.5px] font-bold text-reset-dark">
                  {username}
                </span>
                <span className="block truncate text-[11.5px] text-reset-muted">
                  {truncate(email, 22)}
                </span>
              </span>
            </Link>
            <Link
              href="/settings"
              aria-label="Pengaturan"
              className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full text-reset-muted transition hover:bg-reset-soft hover:text-reset-primary min-[840px]:flex"
            >
              <Settings size={17} />
            </Link>
          </div>
        </div>
      </aside>

      <main className="min-h-dvh pb-24 tablet:pl-[88px] tablet:pb-0 min-[840px]:pl-[236px]">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E7EDE8] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur tablet:hidden">
        <div className="mx-auto flex h-[70px] max-w-lg items-stretch justify-around px-2">
          {DASHBOARD_NAV.map((item) => {
            const Icon = ICONS[item.icon];
            const active = activeTab === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="flex min-w-[64px] flex-1 flex-col items-center justify-center gap-0.5"
              >
                <span
                  className={cn(
                    "flex h-8 w-14 items-center justify-center rounded-full transition-colors",
                    active ? "bg-reset-soft text-reset-primary" : "text-[#75857A]"
                  )}
                >
                  <Icon size={21} strokeWidth={active ? 2.2 : 1.9} />
                </span>
                <span
                  className={cn(
                    "text-[11px] font-semibold",
                    active ? "text-reset-primary" : "text-[#75857A]"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}