"use client";

import { Container } from "@/components/ui/container";
import { useLang } from "@/components/dashboard/lang-provider";
import { STORE_LOGOS } from "@/lib/data";

export function LogoMarquee() {
  const { t } = useLang();
  const doubled = [...STORE_LOGOS, ...STORE_LOGOS];
  return (
    <section className="relative border-y border-white/[0.05] bg-white/[0.015] py-10">
      <Container>
        <p className="mb-7 text-center text-xs font-medium uppercase tracking-[0.22em] text-muted">
          {t("landing.marquee.heading")}
        </p>
      </Container>
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div className="flex w-max animate-marquee items-center gap-14 pe-14 hover:[animation-play-state:paused]">
          {doubled.map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="flex items-center gap-2.5 whitespace-nowrap text-sm font-medium text-muted/80 transition-colors duration-300 hover:text-foreground"
            >
              <span className="size-1.5 rounded-full bg-gradient-to-r from-[#6366f1] to-[#06b6d4]" />
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
