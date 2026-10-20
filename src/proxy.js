import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const AUTH_PAGES = new Set([
  "/welcome",
  "/login",
  "/register",
  "/forgot-password",
]);

const PUBLIC_PAGES = new Set([
  "/welcome",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/offline",
]);

const STATIC_PATTERN =
  /^\/(?:_next\/static|_next\/image|icons\/|favicon\.ico|manifest\.webmanifest|sw\.js)/;

function needsSession(pathname) {
  return (
    pathname !== "/" &&
    !PUBLIC_PAGES.has(pathname) &&
    !pathname.startsWith("/auth/")
  );
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  if (STATIC_PATTERN.test(pathname)) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  let user = null;
  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    user = null;
  }

  if (!user && needsSession(pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    if (pathname !== "/") {
      loginUrl.searchParams.set("next", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  if (user && (AUTH_PAGES.has(pathname) || pathname === "/")) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/home";
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|manifest.webmanifest|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};