import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function safeNext(value) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/home";
  }
  return value;
}

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const next = safeNext(url.searchParams.get("next"));
  const initialError =
    url.searchParams.get("error_description") || url.searchParams.get("error");

  let error = initialError;

  if (!error && (code || tokenHash)) {
    try {
      const supabase = await createClient();
      if (code) {
        const result = await supabase.auth.exchangeCodeForSession(code);
        error = result.error?.message || null;
      } else if (tokenHash) {
        const result = await supabase.auth.verifyOtp({
          type: type || "email",
          token_hash: tokenHash,
        });
        error = result.error?.message || null;
      }
    } catch (caught) {
      error = caught?.message || "Link tidak dapat digunakan.";
    }
  }

  if (error) {
    const loginUrl = new URL("/login", url.origin);
    loginUrl.searchParams.set("auth_error", error);
    return NextResponse.redirect(loginUrl);
  }

  const destination = type === "recovery" ? "/reset-password" : next;
  return NextResponse.redirect(new URL(destination, url.origin));
}