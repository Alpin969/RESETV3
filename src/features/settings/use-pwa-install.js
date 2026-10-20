"use client";

import { useCallback, useEffect, useState } from "react";

export function usePwaInstall() {
  const [deferred, setDeferred] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    try {
      const ua = navigator.userAgent || "";
      setIsIos(/iphone|ipad|ipod/i.test(ua) && !window.MSStream);
      if (window.matchMedia("(display-mode: standalone)").matches || navigator.standalone) {
        setInstalled(true);
      }
    } catch { /* abaikan */ }

    function onBeforeInstall(e) {
      e.preventDefault();
      setDeferred(e);
    }
    function onInstalled() {
      setInstalled(true);
      setDeferred(null);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (installed) return { ok: false, outcome: "installed" };
    if (!deferred) return { ok: false, outcome: "unavailable" };
    setWorking(true);
    try {
      deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice?.outcome === "accepted") {
        setInstalled(true);
        return { ok: true, outcome: "accepted" };
      }
      return { ok: false, outcome: "dismissed" };
    } finally {
      setDeferred(null);
      setWorking(false);
    }
  }, [deferred, installed]);

  let subtitle = "Install RESET agar bisa dibuka seperti aplikasi dari layar utama.";
  if (installed) subtitle = "RESET sudah terpasang di perangkat ini.";
  else if (isIos) subtitle = "Di iPhone/iPad: buka di Safari lalu pilih Bagikan → Add to Home Screen.";
  else if (!deferred) subtitle = "Buka RESET di Chrome/Edge lalu gunakan menu ⋮ → Install app / Add to Home screen.";

  return { install, installed, working, isIos, canPrompt: !!deferred, subtitle };
}
