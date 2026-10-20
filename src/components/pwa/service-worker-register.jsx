"use client";

import { useEffect, useRef, useState } from "react";
import { RefreshCw, X } from "lucide-react";

export default function ServiceWorkerRegister() {
  const [waitingWorker, setWaitingWorker] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const reloadRequested = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }
    if (!("serviceWorker" in navigator)) {
      return undefined;
    }

    const onControllerChange = () => {
      if (reloadRequested.current) {
        window.location.reload();
      }
    };
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange
    );

    if (process.env.NODE_ENV !== "production") {
      return () => {
        navigator.serviceWorker.removeEventListener(
          "controllerchange",
          onControllerChange
        );
      };
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
        }
        registration.addEventListener("updatefound", () => {
          const installing = registration.installing;
          if (!installing) {
            return;
          }
          installing.addEventListener("statechange", () => {
            if (
              installing.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              setWaitingWorker(registration.waiting);
            }
          });
        });
      })
      .catch(() => undefined);

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange
      );
    };
  }, []);

  if (!waitingWorker || dismissed) {
    return null;
  }

  function applyUpdate() {
    reloadRequested.current = true;
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
  }

  return (
    <div className="fixed inset-x-4 bottom-24 z-[120] mx-auto max-w-md animate-fade-up tablet:bottom-6">
      <div className="flex items-center gap-3 rounded-[16px] border border-reset-border bg-reset-dark px-4 py-3 text-white shadow-xl">
        <RefreshCw size={18} className="shrink-0 text-[#A9E2C5]" />
        <p className="min-w-0 flex-1 text-[13px] font-medium">
          Versi baru RESET tersedia.
        </p>
        <button
          type="button"
          onClick={applyUpdate}
          className="rounded-lg bg-white/15 px-3 py-1.5 text-[12.5px] font-semibold hover:bg-white/25"
        >
          Muat ulang
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Tutup notifikasi pembaruan"
          className="rounded-lg p-1 text-white/70 hover:bg-white/10 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}