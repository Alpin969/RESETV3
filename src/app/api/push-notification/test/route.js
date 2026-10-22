import { createClient } from "@/lib/supabase/server";
import webpush from "web-push";

const rateLimitMap = new Map();
const RATE_LIMIT_MS = 60000;

function checkRateLimit(key) {
  const now = Date.now();
  const last = rateLimitMap.get(key);
  if (last && now - last < RATE_LIMIT_MS) {
    return false;
  }
  rateLimitMap.set(key, now);
  return true;
}

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@example.com";

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

export async function POST(request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const rateLimitKey = `push-test:${user.id}`;
    if (!checkRateLimit(rateLimitKey)) {
      return new Response(
        JSON.stringify({ error: "Terlalu banyak request. Coba lagi dalam 1 menit." }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!vapidPublicKey || !vapidPrivateKey) {
      return new Response(
        JSON.stringify({ error: "VAPID keys tidak dikonfigurasi di server." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth_key")
      .eq("user_id", user.id)
      .eq("is_active", true);

    if (error) throw error;

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ error: "Tidak ada subscription push aktif." }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const payload = JSON.stringify({
      title: "RESET - Notifikasi Uji",
      body: "Ini adalah notifikasi uji dari RESET. Notifikasi push berhasil diaktifkan!",
      url: "/",
      icon: "/icons/icon-192.png",
      tag: "test-notification",
    });

    const results = [];
    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth_key,
            },
          },
          payload
        );
        results.push({ endpoint: sub.endpoint, success: true });
      } catch (err) {
        results.push({ endpoint: sub.endpoint, success: false, error: err.message });
      }
    }

    const successCount = results.filter((r) => r.success).length;

    return new Response(
      JSON.stringify({
        success: successCount > 0,
        message: `Notifikasi uji dikirim ke ${successCount} dari ${results.length} subscription.`,
        results,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Push test error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Failed to send test notification" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}