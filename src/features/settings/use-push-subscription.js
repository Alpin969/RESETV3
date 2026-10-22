"use client";

import { useCallback, useEffect, useState } from "react";

const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function usePushSubscription() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsSupported(
      "serviceWorker" in navigator && "PushManager" in window
    );
  }, []);

  const subscribe = useCallback(async () => {
    if (!isSupported || !VAPID_PUBLIC_KEY) {
      setError("Push notification tidak didukung di browser ini.");
      return { ok: false };
    }

    setLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();

      if (existing) {
        await existing.unsubscribe();
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const payload = {
        endpoint: subscription.endpoint,
        p256dh: btoa(
          String.fromCharCode(...new Uint8Array(subscription.getKey("p256dh")))
        ),
        auth_key: btoa(
          String.fromCharCode(...new Uint8Array(subscription.getKey("auth")))
        ),
      };

      const res = await fetch("/api/push-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Gagal menyimpan subscription ke server.");

      setIsSubscribed(true);
      return { ok: true, subscription };
    } catch (err) {
      console.error("Push subscribe error:", err);
      setError(err.message);
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [isSupported, VAPID_PUBLIC_KEY]);

  const unsubscribe = useCallback(async () => {
    if (!isSupported) return { ok: false };

    setLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      const res = await fetch("/api/push-subscription", {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Gagal menonaktifkan push.");

      setIsSubscribed(false);
      return { ok: true };
    } catch (err) {
      console.error("Push unsubscribe error:", err);
      setError(err.message);
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [isSupported]);

  // Check existing subscription on mount
  useEffect(() => {
    if (!isSupported) return;
    let mounted = true;
    (async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (mounted) setIsSubscribed(!!subscription);
      } catch (e) {
        if (mounted) setError(e.message);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isSupported]);

  return { isSupported, isSubscribed, loading, error, subscribe, unsubscribe };
}