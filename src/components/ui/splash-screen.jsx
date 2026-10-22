"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-provider";
import { LeafMark } from "@/components/brand/logo";

export default function SplashScreen() {
  const { loading: authLoading } = useAuth();
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [visible]);

  useEffect(() => {
    if (authLoading) return;

    let removeTimer;
    const fadeTimer = window.setTimeout(() => {
      setLeaving(true);
      removeTimer = window.setTimeout(() => setVisible(false), 380);
    }, 1200);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
    };
  }, [authLoading]);

  if (!visible) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col overflow-hidden bg-[#f2f8f2] transition-opacity duration-300 ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      role="status"
      aria-live="polite"
      aria-label="RESET is loading"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-28 rotate-[18deg] opacity-[0.16] blur-[1px] splash-leaf">
          <LeafMark size={330} id="splash-top" />
        </div>
        <div className="absolute -bottom-36 -right-28 rotate-[-16deg] opacity-[0.13] blur-[1px] splash-leaf" style={{ animationDelay: "-2.8s" }}>
          <LeafMark size={390} id="splash-bottom" />
        </div>
        <div className="absolute left-[12%] top-[22%] h-[46vmin] w-[46vmin] rounded-full bg-[#dcefe2]/70 blur-3xl" />
        <div className="absolute bottom-[4%] right-[8%] h-[38vmin] w-[38vmin] rounded-full bg-[#e5f4e8]/80 blur-3xl" />
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center px-8">
        <div className="splash-logo flex flex-col items-center">
          <div className="relative flex h-[104px] w-[104px] items-center justify-center rounded-[30px] bg-white/80 shadow-[0_16px_50px_rgba(31,106,72,0.16)] ring-1 ring-white/70 backdrop-blur">
            <LeafMark size={64} id="splash-logo" />
          </div>
          <h1 className="mt-7 text-[31px] font-extrabold leading-none tracking-[0.34em] text-[#214634]">
            RESET
          </h1>
          <p className="mt-4 text-[13.5px] font-medium tracking-[0.02em] text-[#7c8e81]">
            Better Habits <span className="px-1 text-[#b3c2b6]">·</span> Brighter Future
          </p>
        </div>
      </div>

      <div className="relative flex w-full flex-col items-center gap-5 pb-[max(54px,calc(env(safe-area-inset-bottom)+34px))]">
        <div className="h-1 w-[190px] overflow-hidden rounded-full bg-[#dfeae1]">
          <div className="splash-bar h-full w-1/3 rounded-full bg-[#2f8a60]" />
        </div>
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#9aab9d]">
          A fresh start
        </p>
      </div>
    </div>
  );
}
