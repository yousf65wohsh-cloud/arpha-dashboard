"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Check,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Send,
  Twitter,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/landing/brand";
import { useLang } from "@/components/dashboard/lang-provider";
import { FOOTER_LINKS } from "@/lib/data";

const SOCIALS: { icon: LucideIcon; label: string; href: string }[] = [
  { icon: Twitter, label: "Twitter / X", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
  { icon: Github, label: "GitHub", href: "#" },
];

interface NewsletterForm {
  email: string;
}

function NewsletterForm() {
  const [subscribed, setSubscribed] = useState(false);
  const { t } = useLang();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsletterForm>({ mode: "onBlur" });

  const onSubmit = () => {
    setSubscribed(true);
    reset();
    setTimeout(() => setSubscribed(false), 4000);
  };

  if (subscribed) {
    return (
      <div className="flex h-12 items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 text-sm font-medium text-emerald-300">
        <Check className="size-4" />
        {t("landing.footer.subscribed")}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2.5 sm:flex-row">
      <div className="flex-1">
        <Input
          type="email"
          placeholder={t("landing.footer.emailPlaceholder")}
          aria-label={t("landing.footer.emailPlaceholder")}
          aria-invalid={!!errors.email}
          className="h-12"
          {...register("email", {
            required: t("landing.footer.emailRequired"),
            pattern: { value: /^\S+@\S+\.\S+$/, message: t("landing.footer.emailInvalid") },
          })}
        />
        {errors.email && (
          <p className="mt-1.5 text-xs text-red-300">{errors.email.message}</p>
        )}
      </div>
      <Button type="submit" size="lg" className="h-12">
        {t("landing.footer.subscribe")}
        <Send className="size-4 rtl:rotate-180" />
      </Button>
    </form>
  );
}

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="relative border-t border-white/[0.06] bg-white/[0.015]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <Container className="pb-10 pt-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          {/* Brand + newsletter */}
          <div className="max-w-md">
            <Brand size="lg" />
            <p className="mt-5 text-sm leading-relaxed text-muted">
              {t("landing.footer.tagline")}
            </p>
            <div className="mt-7">
              <p className="mb-3 text-sm font-medium text-foreground">
                {t("landing.footer.updates")}
              </p>
              <NewsletterForm />
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {FOOTER_LINKS.map((group) => (
              <div key={group.id}>
                <h3 className="text-sm font-semibold text-foreground">
                  {t(`landing.footer.${group.id}`)}
                </h3>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {group.links.map((link) => (
                    <li key={link.key}>
                      <a
                        href={link.href}
                        className="text-sm text-muted transition-colors duration-300 hover:text-foreground"
                      >
                        {t(link.key)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-5 border-t border-white/[0.06] pt-7 sm:flex-row">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} Arpha. {t("landing.footer.rights")}
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <MapPin className="size-3.5" />
            Baghdad · Erbil · Basra
            <span className="mx-1 text-white/15">|</span>
            <Mail className="size-3.5" />
            hello@arpha.app
          </p>
          <div className="flex items-center gap-2">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="grid size-9 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-muted transition-all duration-300 hover:border-primary/40 hover:text-foreground hover:shadow-glow-primary"
              >
                <social.icon className="size-4" />
              </a>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
