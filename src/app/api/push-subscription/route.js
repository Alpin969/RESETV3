import { createClient } from "@/lib/supabase/server";

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

    const rateLimitKey = `push-subscribe:${user.id}`;
    if (!checkRateLimit(rateLimitKey)) {
      return new Response(
        JSON.stringify({ error: "Terlalu banyak request. Coba lagi sebentar." }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const body = await request.json();
    const { endpoint, p256dh, auth_key } = body;

    if (!endpoint || typeof endpoint !== "string" || endpoint.length < 5) {
      return new Response(
        JSON.stringify({ error: "Endpoint tidak valid" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!p256dh || typeof p256dh !== "string") {
      return new Response(
        JSON.stringify({ error: "p256dh tidak valid" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!auth_key || typeof auth_key !== "string") {
      return new Response(
        JSON.stringify({ error: "auth_key tidak valid" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { error } = await supabase.from("push_subscriptions").upsert({
      user_id: user.id,
      endpoint,
      p256dh,
      auth_key,
      is_active: true,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, message: "Push subscription saved" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Push subscription error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Failed to save subscription" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function DELETE(request) {
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

    const rateLimitKey = `push-unsubscribe:${user.id}`;
    if (!checkRateLimit(rateLimitKey)) {
      return new Response(
        JSON.stringify({ error: "Terlalu banyak request. Coba lagi sebentar." }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { error } = await supabase
      .from("push_subscriptions")
      .update({ is_active: false })
      .eq("user_id", user.id);

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, message: "Push subscription disabled" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Push unsubscribe error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Failed to unsubscribe" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}