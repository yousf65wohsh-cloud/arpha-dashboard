import Link from "next/link";
import { Nav } from "@/components/nav";

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[220px_1fr]">
      <aside className="md:min-h-screen border-b md:border-b-0 md:border-l border-line bg-paper px-4 py-4 md:py-6">
        <Link href="/" className="hidden md:block mb-8">
          <div className="text-xl font-semibold tracking-tight">ارفا</div>
          <div className="text-xs text-muted">لوحة الإدارة</div>
        </Link>
        <Nav />
      </aside>
      <main className="px-5 md:px-8 py-6 md:py-8 max-w-6xl">{children}</main>
    </div>
  );
}
