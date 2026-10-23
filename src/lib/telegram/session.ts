import { createHmac, timingSafeEqual } from "crypto";

const TTL_SEC = 60 * 60 * 24 * 7;

type TgSessionPayload = {
  userId: string;
  telegramId: string;
  exp: number;
};

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET не задан");
  return value;
}

function b64url(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64url");
}

export function signTelegramSession(userId: string, telegramId: string): string {
  const payload: TgSessionPayload = {
    userId,
    telegramId,
    exp: Math.floor(Date.now() / 1000) + TTL_SEC,
  };
  const body = b64url(JSON.stringify(payload));
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyTelegramSession(
  token: string | null | undefined,
): TgSessionPayload | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as TgSessionPayload;
    if (!payload.userId || !payload.exp || payload.exp < Date.now() / 1000) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function telegramTokenFromRequest(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return request.headers.get("x-telegram-session");
}
