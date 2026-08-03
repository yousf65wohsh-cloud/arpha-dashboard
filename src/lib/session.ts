import { createHmac, timingSafeEqual } from "crypto";

import { SESSION_COOKIE } from "./constants";
export { SESSION_COOKIE };

function secret() {
  return process.env.SESSION_SECRET || "insecure-development-secret";
}

export function signSession() {
  const issued = Date.now().toString();
  return `${issued}.${createHmac("sha256", secret()).update(issued).digest("hex")}`;
}

export function verifySession(value: string | undefined) {
  if (!value) return false;
  const [issued, sig] = value.split(".");
  if (!issued || !sig) return false;
  const expected = createHmac("sha256", secret()).update(issued).digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  return Date.now() - Number(issued) < 7 * 24 * 60 * 60 * 1000;
}
