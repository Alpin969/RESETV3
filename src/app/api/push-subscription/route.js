import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();
    const { endpoint, p256dh, auth_key } = body;

    if (!endpoint || !p256dh || !auth_key) {
      return new Response(
        JSON.stringify({ error: "Missing subscription fields" }),
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
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
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