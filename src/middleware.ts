import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";

// Edge runtime: no node:crypto here. Full signature verification happens in
// the server components; this gate only checks a cookie is present and
// well-formed, which is enough to keep the console off the open internet.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/login") || pathname.startsWith("/api/login")) {
    return NextResponse.next();
  }
  const raw = req.cookies.get(SESSION_COOKIE)?.value;
  const looksValid = !!raw && /^\d+\.[a-f0-9]{64}$/.test(raw);
  if (!looksValid) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
