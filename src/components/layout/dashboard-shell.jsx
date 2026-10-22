"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  Bell,
  CalendarDays,
  ChevronRight,
  Download,
  House,
  MoonStar,
  MoreHorizontal,
  PiggyBank,
  Settings,
  TrendingUp,
  X,
} from "lucide-react";
import { DASHBOARD_NAV, MOBILE_NAV, MORE_NAV } from "@/lib/constants/navigation";
import { useAuth } from "@/features/auth/auth-provider";
import { cn } from "@/lib/utils/cn";
import Avatar from "@/components/ui/avatar";
import Logo, { LeafMark } from "@/components/brand/logo";

const ICONS = {
  home: House,
  history: CalendarDays,
  progress: TrendingUp,
  settings: Settings,
  sleep: MoonStar,
  savings: PiggyBank,
  reminders: Bell,
  archive: Archive,
  download: Download,
  more: MoreHorizontal,
};

function isActivePath(pathname, href) {
  if (!pathname) return false;
  return pathname === href || (href !== "/home" && pathname.startsWith(`${href}/`));
}

export default function DashboardShell({ children }) {
  const pathname = usePathname();
  const { profile, user } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  const username = profile?.username || user?.email?.split("@")[0] || "Friend";
  const handle = `@${String(username).toLowerCase().replace(/\s+/g, "")}`;
  const moreActive = MORE_NAV.some((item) => isActivePath(pathname, item.href));

  return (
    <div className="min-h-dvh">
      <aside
        className="fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-reset-sidebar-border bg-reset-sidebar tablet:flex tablet:w-[76px] desktop:w-[250px]"
        aria-label="Main navigation"
      >
        <Link
          href="/home"
          className="flex h-[68px] shrink-0 items-center justify-center gap-2.5 px-3 desktop:justify-start desktop:px-6"
          aria-label="RESET Home"
        >
          <LeafMark size={32} id="sidebar-logo" />
          <span className="hidden text-[19px] font-extrabold tracking-[0.1em] text-reset-dark desktop:inline">
            RESET
          </span>
        </Link>

        <nav className="flex-1 overflow-y-auto px-2.5 py-4 desktop:px-4" role="navigation" aria-label="Dashboard">
          <div className="space-y-1">
            {DASHBOARD_NAV.map((item) => {
              const Icon = ICONS[item.icon];
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex items-center justify-center gap-3 rounded-[11px] px-3 py-2.5 text-[13.5px] font-semibold transition-all duration-150 desktop:justify-start",
                    active
                      ? "bg-reset-primary text-white shadow-[0_6px_16px_rgba(47,138,96,0.2)]"
                      : "text-[#7a8c80] hover:bg-reset-primary-soft hover:text-reset-dark"
                  )}
                >
                  <Icon size={19} strokeWidth={active ? 2.2 : 1.9} aria-hidden="true" className="shrink-0" />
                  <span className="hidden truncate desktop:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="shrink-0 space-y-3 px-2.5 pb-4 desktop:px-4">
          <div className="relative hidden overflow-hidden rounded-[13px] border border-[#e6efe7] bg-[#f3f9f3] p-3.5 desktop:block">
            <p className="text-[12.5px] font-bold text-reset-dark">Keep going!</p>
            <p className="mt-1 text-[11px] leading-[1.5] text-[#7f9284]">
              Small steps everyday lead to big changes.
            </p>
            <LeafMark size={58} id="sidebar-keep" className="absolute -bottom-4 -right-3 opacity-20" />
          </div>

          <Link
            href="/settings"
            className="flex items-center justify-center gap-2.5 rounded-[12px] p-1.5 transition hover:bg-white desktop:justify-start desktop:p-2"
            aria-label="Profile settings"
          >
            <Avatar src={profile?.avatar_url} name={username} size={36} />
            <div className="hidden min-w-0 flex-1 desktop:block">
              <p className="truncate text-[12.5px] font-bold text-reset-dark">{username}</p>
              <p className="truncate text-[11px] text-reset-muted">{handle}</p>
            </div>
            <ChevronRight size={16} className="hidden shrink-0 text-reset-muted desktop:block" />
          </Link>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-[#e8efe9]/80 bg-[#f5faf5]/92 pt-[env(safe-area-inset-top)] backdrop-blur-md tablet:hidden">
        <div className="flex h-[58px] items-center justify-between px-4">
          <Link href="/home" aria-label="RESET Home">
            <Logo size={25} textClassName="text-[17px] tracking-[0.1em]" id="mobile-header-logo" />
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href="/reminders"
              aria-label="Reminders"
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#5d7164] transition hover:bg-white hover:text-reset-primary"
            >
              <Bell size={19} strokeWidth={1.9} />
            </Link>
            <Link
              href="/settings"
              aria-label="Settings"
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#5d7164] transition hover:bg-white hover:text-reset-primary"
            >
              <Settings size={19} strokeWidth={1.9} />
            </Link>
          </div>
        </div>
      </header>

      <main className="min-h-dvh pb-[calc(76px+env(safe-area-inset-bottom))] tablet:pl-[76px] tablet:pb-[calc(76px+env(safe-area-inset-bottom))] desktop:pl-[250px] desktop:pb-0">
        {children}
      </main>

      <nav
        className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-reset-border bg-white/96 backdrop-blur-md desktop:hidden"
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="mx-auto flex h-[64px] max-w-xl items-center justify-around px-2">
          {MOBILE_NAV.map((item) => {
            const Icon = ICONS[item.icon];
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="bottom-nav-item"
              >
                <span className={cn("bottom-nav-icon", active ? "bottom-nav-icon-active" : "bottom-nav-icon-inactive")}>
                  <Icon size={20} strokeWidth={active ? 2.3 : 1.9} />
                </span>
                <span className={cn("bottom-nav-label", active ? "bottom-nav-label-active" : "bottom-nav-label-inactive")}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setMoreOpen((open) => !open)}
            aria-expanded={moreOpen}
            aria-label="More options"
            className="bottom-nav-item"
          >
            <span className={cn("bottom-nav-icon", moreActive || moreOpen ? "bottom-nav-icon-active" : "bottom-nav-icon-inactive")}>
              <MoreHorizontal size={20} strokeWidth={moreActive || moreOpen ? 2.3 : 1.9} />
            </span>
            <span className={cn("bottom-nav-label", moreActive || moreOpen ? "bottom-nav-label-active" : "bottom-nav-label-inactive")}>
              More
            </span>
          </button>
        </div>
      </nav>

      {moreOpen ? (
        <div className="fixed inset-0 z-50 desktop:hidden" role="presentation">
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-[#10271d]/30 backdrop-blur-[2px] animate-fade"
            aria-label="Close menu"
            onClick={() => setMoreOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] mx-auto max-w-xl animate-sheet-up rounded-t-[24px] border border-b-0 border-reset-border bg-white px-4 pb-4 pt-3 shadow-[0_-12px_40px_rgba(25,61,45,0.12)]">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[13px] font-bold text-reset-dark">More</p>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                aria-label="Close menu"
                className="flex h-8 w-8 items-center justify-center rounded-full text-reset-muted hover:bg-reset-bg"
              >
                <X size={17} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {MORE_NAV.map((item) => {
                const Icon = ICONS[item.icon];
                const active = isActivePath(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-[13px] border px-2 py-3 text-center transition",
                      active
                        ? "border-reset-primary/25 bg-reset-soft text-reset-primary"
                        : "border-reset-border bg-[#fbfdfb] text-[#637769] hover:border-[#cfe2d5]"
                    )}
                  >
                    <Icon size={21} strokeWidth={active ? 2.2 : 1.8} />
                    <span className="truncate text-[11px] font-semibold">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
