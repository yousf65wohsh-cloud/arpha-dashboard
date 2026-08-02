import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { LangProvider } from "@/components/dashboard/lang-provider";

export const metadata: Metadata = {
  metadataBase: new URL("https://arpha.app"),
  title: {
    default: "أربا — نظام التشغيل الذكي للأعمال",
    template: "%s · أربا",
  },
  description:
    "يمنحك أربا بوت ذكاء اصطناعي على تيليغرام ومديرًا ذكيًا ولوحة تحكم كاملة — تحليلات وطلبات وفواتير وذاكرة ذكية في مكان واحد. صُمم للأعمال العراقية.",
  keywords: [
    "Arpha",
    "أربا",
    "AI SaaS",
    "Telegram bot",
    "Iraqi business",
    "store dashboard",
    "AI agent",
    "n8n",
    "Supabase",
  ],
  openGraph: {
    type: "website",
    title: "أربا — نظام التشغيل الذكي للأعمال",
    description:
      "بوتات ذكاء اصطناعي على تيليغرام وتحليلات ذكية ولوحة تحكم كاملة لمتجرك. صُمم للأعمال العراقية.",
    siteName: "Arpha",
  },
  twitter: {
    card: "summary_large_image",
    title: "أربا — نظام التشغيل الذكي للأعمال",
    description:
      "بوتات ذكاء اصطناعي على تيليغرام وتحليلات ذكية ولوحة تحكم كاملة لمتجرك. صُمم للأعمال العراقية.",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
