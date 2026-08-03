import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";
import { createServerClient } from "@supabase/ssr";

// Edge runtime: لا node:crypto هنا. فحص التوقيع الكامل يجري في مكونات الخادم؛
// هذه البوابة تتحقق فقط من وجود كوكي بحالة سليمة — يكفي لإبقاء الكونسول بعيداً عن الإنترنت المفتوح.
//
// قسم /store مخصص لصاحب المتجر (جلسة Supabase) — لا يمر عبر حارس الأدمن.

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ---- منطقة المتجر: تحديث جلسة Supabase وحمايتها ----
  if (pathname.startsWith("/store")) {
    let response = NextResponse.next({ request: req });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(items: { name: string; value: string; options: Record<string, unknown> }[]) {
            items.forEach(({ name, value }) => req.cookies.set(name, value));
            response = NextResponse.next({ request: req });
            items.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    const { data } = await supabase.auth.getUser();

    const isStoreArea = pathname.startsWith("/store") && !pathname.startsWith("/store/login");

    if (isStoreArea && !data?.user) {
      const url = req.nextUrl.clone();
      url.pathname = "/store/login";
      url.searchParams.set("reason", "session");
      return NextResponse.redirect(url);
    }

    return response;
  }

  // ---- الكونسول الإداري: البوابة القائمة ----
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
