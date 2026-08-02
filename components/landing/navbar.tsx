"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Brand } from "@/components/landing/brand";
import { useLang } from "@/components/dashboard/lang-provider";
import { NAV_LINKS } from "@/lib/data";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-white/[0.06] bg-background/75 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <Container>
        <nav className="flex h-16 items-center justify-between gap-4">
          <a href="#" aria-label="Arpha home" className="shrink-0">
            <Brand />
          </a>

          <div className="hidden items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.02] p-1 backdrop-blur-md lg:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-[13px] font-medium text-muted transition-colors duration-300 hover:bg-white/[0.06] hover:text-foreground"
              >
                {t(link.key)}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2.5">
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/dashboard">{t("landing.nav.signIn")}</Link>
            </Button>
            <Button size="sm" asChild>
              <a href="#pricing">
                {t("landing.nav.getStarted")}
                <ArrowRight className="size-4 rtl:rotate-180" />
              </a>
            </Button>
            <button
              type="button"
              aria-label={open ? t("landing.nav.closeMenu") : t("landing.nav.openMenu")}
              onClick={() => setOpen((v) => !v)}
              className="grid size-9 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-foreground lg:hidden"
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </nav>
      </Container>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-b border-white/[0.06] bg-background/95 backdrop-blur-xl lg:hidden"
          >
            <Container className="py-4">
              <div className="flex flex-col gap-1">
                {NAV_LINKS.map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    initial={reduce ? false : { opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-muted transition-colors hover:bg-white/[0.05] hover:text-foreground"
                  >
                    {t(link.key)}
                  </motion.a>
                ))}
                <div className="mt-3 flex flex-col gap-2 border-t border-white/[0.06] pt-4">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/dashboard">{t("landing.nav.signIn")}</Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <a href="#pricing" onClick={() => setOpen(false)}>
                      {t("landing.nav.getStarted")}
                      <ArrowRight className="size-4 rtl:rotate-180" />
                    </a>
                  </Button>
                </div>
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
