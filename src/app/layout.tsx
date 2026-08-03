import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ارفا — لوحة الإدارة",
  description: "إدارة متاجر ارفا وطلباتها",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
