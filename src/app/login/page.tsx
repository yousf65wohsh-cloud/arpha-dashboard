export default function Login({
  searchParams,
}: {
  searchParams: { e?: string; next?: string };
}) {
  const error =
    searchParams.e === "wrong"
      ? "كلمة المرور غير صحيحة."
      : searchParams.e === "unset"
      ? "لم تُضبط ADMIN_PASSWORD على الخادم. اضبطها ثم أعد المحاولة."
      : null;

  return (
    <main className="min-h-screen grid place-items-center px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <div className="text-3xl font-semibold tracking-tight">ارفا</div>
          <p className="text-sm text-muted mt-1">لوحة الإدارة</p>
        </div>
        <form action="/api/login" method="post" className="card p-6 space-y-4">
          <input type="hidden" name="next" value={searchParams.next ?? "/"} />
          <div>
            <label htmlFor="password" className="label block mb-2">كلمة المرور</label>
            <input id="password" name="password" type="password" autoFocus required className="field" />
          </div>
          {error && <p className="text-sm text-alert">{error}</p>}
          <button type="submit" className="btn-primary w-full">دخول</button>
        </form>
        <p className="text-xs text-muted mt-4 leading-relaxed">
          كلمة مرور واحدة مشتركة لهذه النسخة التجريبية. تسجيل دخول منفصل لكل متجر يأتي لاحقاً.
        </p>
      </div>
    </main>
  );
}
