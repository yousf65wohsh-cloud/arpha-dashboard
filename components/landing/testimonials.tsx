"use client";

import { Quote, Star } from "lucide-react";
import type { Testimonial } from "@/types";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/landing/section-heading";
import { Stagger, StaggerItem } from "@/components/landing/scroll-reveal";
import { Avatar } from "@/components/dashboard/customers-list";
import { useLang } from "@/components/dashboard/lang-provider";
import { TESTIMONIALS } from "@/lib/data";

function Stars({ count }: { count: number }) {
  const { t } = useLang();
  return (
    <span className="flex items-center gap-0.5" aria-label={t("landing.testimonials.starsLabel").replace("{n}", String(count))}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={i < count ? "size-3.5 fill-amber-300 text-amber-300" : "size-3.5 text-white/15"}
        />
      ))}
    </span>
  );
}

function TestimonialCard({ t: item, index }: { t: Testimonial; index: number }) {
  const { t } = useLang();
  return (
    <StaggerItem className="h-full">
      <figure className="group relative flex h-full flex-col rounded-2xl border border-white/[0.06] bg-surface/50 p-6 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-white/[0.12] hover:bg-surface">
        <Quote
          aria-hidden
          className="absolute end-5 top-5 size-7 text-white/[0.05] transition-colors duration-500 group-hover:text-primary/25"
        />
        <Stars count={item.rating} />
        <blockquote className="mt-4 flex-1 text-[14.5px] leading-relaxed text-foreground/90">
          “{t(`landing.testimonials.${item.id}.quote`)}”
        </blockquote>
        <figcaption className="mt-6 flex items-center gap-3 border-t border-white/[0.06] pt-5">
          <Avatar initials={item.initials} index={index} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
            <p className="truncate text-xs text-muted">
              {t(item.role)} ·{" "}
              <span className="text-indigo-300/80">{item.store}</span>
            </p>
          </div>
        </figcaption>
      </figure>
    </StaggerItem>
  );
}

export function Testimonials() {
  const { t } = useLang();
  return (
    <section id="testimonials" className="relative scroll-mt-24 py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow={t("landing.testimonials.eyebrow")}
          title={t("landing.testimonials.title")}
          description={t("landing.testimonials.description")}
        />

        <Stagger className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((item, i) => (
            <TestimonialCard key={item.id} t={item} index={i} />
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
