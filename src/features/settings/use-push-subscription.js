"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

const rateLimitMap = new Map();
const RATE_LIMIT_MS = 10000;

function checkRateLimit(key) {
  const now = Date.now();
  const last = rateLimitMap.get(key);
  if (last && now - last < RATE_LIMIT_MS) {
    return false;
  }
  rateLimitMap.set(key, now);
  return true;
}

export function usePushSubscription() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const subscribingRef = useRef(false);

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

    if (!checkRateLimit("push-subscribe")) {
      setError("Terlalu banyak request. Coba lagi sebentar.");
      return { ok: false };
    }

    if (subscribingRef.current) return { ok: false };
    subscribingRef.current = true;

    setLoading(true);
    setError(null);

    let newSubscription = null;
    let oldSubscription = null;

    try {
      const registration = await navigator.serviceWorker.ready;
      oldSubscription = await registration.pushManager.getSubscription();

      if (oldSubscription) {
        const existingKey = oldSubscription.options?.applicationServerKey;
        if (existingKey) {
          const existingKeyStr = btoa(
            String.fromCharCode(...new Uint8Array(existingKey))
          );
          if (existingKeyStr === VAPID_PUBLIC_KEY) {
            const payload = {
              endpoint: oldSubscription.endpoint,
              p256dh: btoa(
                String.fromCharCode(
                  ...new Uint8Array(oldSubscription.getKey("p256dh"))
                )
              ),
              auth_key: btoa(
                String.fromCharCode(
                  ...new Uint8Array(oldSubscription.getKey("auth"))
                )
              ),
            };

            const res = await fetch("/api/push-subscription", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

            if (res.ok) {
              setIsSubscribed(true);
              return { ok: true, subscription: oldSubscription };
            }
          }
        }
      }

      newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const payload = {
        endpoint: newSubscription.endpoint,
        p256dh: btoa(
          String.fromCharCode(...new Uint8Array(newSubscription.getKey("p256dh")))
        ),
        auth_key: btoa(
          String.fromCharCode(...new Uint8Array(newSubscription.getKey("auth")))
        ),
      };

      const res = await fetch("/api/push-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Gagal menyimpan subscription ke server.");

      if (oldSubscription && oldSubscription !== newSubscription) {
        await oldSubscription.unsubscribe().catch(() => undefined);
      }

      setIsSubscribed(true);
      return { ok: true, subscription: newSubscription };
    } catch (err) {
      console.error("Push subscribe error:", err);
      setError(err.message);

      if (newSubscription) {
        await newSubscription.unsubscribe().catch(() => undefined);
      }

      return { ok: false, error: err.message };
    } finally {
      subscribingRef.current = false;
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