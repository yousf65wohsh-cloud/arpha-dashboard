import { NextResponse } from "next/server";
import { signSession, SESSION_COOKIE } from "@/lib/session";

export async function POST(req: Request) {
  const form = await req.formData();
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "/");
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return NextResponse.redirect(new URL("/login?e=unset", req.url), 303);
  }
  if (password !== expected) {
    return NextResponse.redirect(new URL("/login?e=wrong", req.url), 303);
  }

  const res = NextResponse.redirect(new URL(next.startsWith("/") ? next : "/", req.url), 303);
  res.cookies.set(SESSION_COOKIE, signSession(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
  return res;
}
