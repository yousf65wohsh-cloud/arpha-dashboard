"use client";

import { MessageCircleQuestion } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/landing/scroll-reveal";
import { useLang } from "@/components/dashboard/lang-provider";
import { FAQ_ITEMS } from "@/lib/data";

export function Faq() {
  const { t } = useLang();
  return (
    <section id="faq" className="relative scroll-mt-24 py-24 sm:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute end-0 top-1/3 -z-10 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,rgba(6,182,212,0.1),transparent)] blur-3xl"
      />
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-indigo-300 backdrop-blur-sm">
                <span className="size-1.5 rounded-full bg-gradient-to-r from-[#6366f1] to-[#06b6d4]" />
                {t("landing.faq.eyebrow")}
              </span>
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="mt-4 text-balance font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">
                {t("landing.faq.title1")}
                <br />
                <span className="text-gradient">{t("landing.faq.title2")}</span>
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
                {t("landing.faq.description")}
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <Button variant="outline" className="mt-7" asChild>
                <a href="#">
                  <MessageCircleQuestion className="size-4" />
                  {t("landing.faq.support")}
                </a>
              </Button>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <Accordion type="single" collapsible className="flex flex-col gap-3">
              {FAQ_ITEMS.map((item, i) => (
                <AccordionItem key={item.id} value={`item-${i}`}>
                  <AccordionTrigger className="text-[15px] text-foreground/90">
                    {t(`landing.faq.${item.id}.q`)}
                  </AccordionTrigger>
                  <AccordionContent>{t(`landing.faq.${item.id}.a`)}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
