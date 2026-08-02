import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number in Iraqi Dinar with Western (Latin) digits,
 * e.g. "48,210 د.ع". `ar-IQ-u-nu-latn` forces 0-9 digits in Arabic.
 */
export function formatIQD(value: number, lang: "en" | "ar" = "en") {
  return new Intl.NumberFormat(lang === "ar" ? "ar-IQ-u-nu-latn" : "en-IQ", {
    style: "currency",
    currency: "IQD",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Formats a plain number with Western digits (no currency). */
export function formatNumber(value: number, lang: "en" | "ar" = "en") {
  return new Intl.NumberFormat(lang === "ar" ? "ar-IQ-u-nu-latn" : "en-US", {
    maximumFractionDigits: 1,
  }).format(value);
}

/** Formats a value as an IQD range for demo pricing (e.g. "68,000 د.ع"). */
export function formatIQDThousand(value: number, lang: "en" | "ar" = "en") {
  return formatIQD(value, lang);
}

export function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompact(value: number, lang: "en" | "ar" = "en") {
  return new Intl.NumberFormat(lang === "ar" ? "ar-IQ-u-nu-latn" : "en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/** Compact IQD currency, e.g. "48.2 ألف د.ع" (ar) / "IQD 48.2K" (en). */
export function formatIQDCompact(value: number, lang: "en" | "ar" = "en") {
  return new Intl.NumberFormat(lang === "ar" ? "ar-IQ-u-nu-latn" : "en-IQ", {
    style: "currency",
    currency: "IQD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
