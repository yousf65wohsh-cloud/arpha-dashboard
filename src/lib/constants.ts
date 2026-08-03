// Kept separate from session.ts so the Edge middleware can import the cookie
// name without pulling node:crypto into the Edge runtime.
export const SESSION_COOKIE = "arpha_session";
