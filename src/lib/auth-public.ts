/** Публичный флаг Google OAuth (без секретов). */
export function isGoogleAuthEnabled() {
  return process.env.NEXT_PUBLIC_GOOGLE_AUTH === "1";
}
