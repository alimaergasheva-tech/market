import { auth } from "@/auth";
import {
  telegramTokenFromRequest,
  verifyTelegramSession,
} from "@/lib/telegram/session";

/** Пользователь из Auth.js cookie или Telegram Mini App токена. */
export async function getRequestUserId(
  request?: Request,
): Promise<string | null> {
  const session = await auth();
  if (session?.user?.id) return session.user.id;

  if (request) {
    const tg = verifyTelegramSession(telegramTokenFromRequest(request));
    if (tg?.userId) return tg.userId;
  }

  return null;
}
