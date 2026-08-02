"use client";

import { ArrowRight, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/landing/scroll-reveal";
import { useLang } from "@/components/dashboard/lang-provider";

export function Cta() {
  const { t } = useLang();
  return (
    <section className="relative py-24 sm:py-28">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 px-6 py-16 text-center sm:px-16 sm:py-20">
            {/* Background */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#4f46e5] via-[#5b3fd6] to-[#0e7490]" />
            <div className="absolute inset-0 -z-10 bg-grid opacity-40 mask-radial-fade" />
            <div
              aria-hidden
              className="absolute -end-20 -top-24 -z-10 size-80 rounded-full bg-white/10 blur-3xl"
            />
            <div
              aria-hidden
              className="absolute -bottom-24 -start-16 -z-10 size-72 rounded-full bg-[#06b6d4]/30 blur-3xl"
            />

            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-md">
              <CalendarClock className="size-3.5" />
              {t("landing.cta.badge")}
            </span>

            <h2 className="mx-auto mt-6 max-w-2xl text-balance font-display text-3xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl">
              {t("landing.cta.title")}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-indigo-100/90 sm:text-lg">
              {t("landing.cta.description")}
            </p>

            <div className="mt-9 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
              <Button
                size="xl"
                className="w-full bg-white text-[#4f46e5] shadow-[0_16px_50px_-12px_rgba(0,0,0,0.5)] hover:bg-indigo-50 sm:w-auto"
                asChild
              >
                <a href="#pricing">
                  {t("landing.cta.primary")}
                  <ArrowRight className="size-4 rtl:rotate-180" />
                </a>
              </Button>
              <Button
                size="xl"
                variant="outline"
                className="w-full border-white/25 bg-white/10 text-white hover:border-white/40 hover:bg-white/15 sm:w-auto"
                asChild
              >
                <a href="#how-it-works">{t("landing.cta.secondary")}</a>
              </Button>
            </div>

            <p className="mt-6 text-xs text-indigo-100/80">{t("landing.cta.note")}</p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
