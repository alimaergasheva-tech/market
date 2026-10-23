import { createHmac, timingSafeEqual } from "crypto";

export type TelegramWebAppUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
};

export type VerifiedTelegramInitData = {
  user: TelegramWebAppUser;
  authDate: number;
  startParam?: string;
  raw: Record<string, string>;
};

/**
 * Проверка Telegram WebApp initData (HMAC-SHA256).
 * @see https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function verifyTelegramInitData(
  initData: string,
  botToken: string,
  maxAgeSec = 60 * 60 * 24,
): VerifiedTelegramInitData {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) throw new Error("Нет hash в initData");

  params.delete("hash");
  const entries = [...params.entries()].sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join("\n");

  const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
  const calculated = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  const a = Buffer.from(calculated, "hex");
  const b = Buffer.from(hash, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error("Подпись initData неверна");
  }

  const authDate = Number(params.get("auth_date") ?? 0);
  if (!authDate || Date.now() / 1000 - authDate > maxAgeSec) {
    throw new Error("initData устарела");
  }

  const userRaw = params.get("user");
  if (!userRaw) throw new Error("Нет user в initData");
  const user = JSON.parse(userRaw) as TelegramWebAppUser;
  if (!user?.id) throw new Error("Некорректный user");

  const raw: Record<string, string> = {};
  for (const [k, v] of params.entries()) raw[k] = v;

  return {
    user,
    authDate,
    startParam: params.get("start_param") ?? undefined,
    raw,
  };
}

export function telegramDisplayName(user: TelegramWebAppUser): string {
  const parts = [user.first_name, user.last_name].filter(Boolean);
  if (parts.length) return parts.join(" ");
  if (user.username) return `@${user.username}`;
  return `Telegram ${user.id}`;
}
