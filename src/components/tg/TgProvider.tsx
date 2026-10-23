"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import WebApp from "@twa-dev/sdk";
import {
  parseStartParam,
  setTelegramToken,
  tgFetch,
} from "@/lib/telegram/client";

type TgUser = {
  id: string;
  name: string;
  telegramId: string;
};

type TgContextValue = {
  ready: boolean;
  user: TgUser | null;
  error: string | null;
  isTelegram: boolean;
  refreshAuth: () => Promise<void>;
};

const TgContext = createContext<TgContextValue | null>(null);

export function useTg() {
  const ctx = useContext(TgContext);
  if (!ctx) throw new Error("useTg вне TgProvider");
  return ctx;
}

export function TgProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<TgUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTelegram, setIsTelegram] = useState(false);

  const refreshAuth = useCallback(async () => {
    try {
      const initData = WebApp.initData;
      if (!initData) {
        // Браузер вне Telegram — демо-режим без токена
        setIsTelegram(false);
        setReady(true);
        return;
      }
      setIsTelegram(true);
      WebApp.ready();
      WebApp.expand();
      WebApp.setHeaderColor("secondary_bg_color");
      WebApp.setBackgroundColor("bg_color");

      const res = await tgFetch("/api/telegram/auth", {
        method: "POST",
        body: JSON.stringify({ initData }),
      });
      const data = (await res.json()) as {
        error?: string;
        token?: string;
        user?: TgUser;
        startParam?: string | null;
      };
      if (!res.ok || !data.token || !data.user) {
        setError(data.error ?? "Не удалось войти через Telegram");
        setReady(true);
        return;
      }

      setTelegramToken(data.token);
      setUser(data.user);
      setError(null);

      // merge локальной корзины/избранного в аккаунт Telegram
      const { getCartItems, replaceCartItems } = await import(
        "@/store/cart-store"
      );
      const { getFavoriteIds, replaceFavorites } = await import(
        "@/store/favorites-store"
      );
      const cartRes = await tgFetch("/api/cart", {
        method: "POST",
        body: JSON.stringify({ items: getCartItems() }),
      });
      if (cartRes.ok) {
        const payload = (await cartRes.json()) as {
          items: { productId: string; quantity: number }[];
        };
        replaceCartItems(payload.items);
      }
      const favRes = await tgFetch("/api/favorites", {
        method: "POST",
        body: JSON.stringify({ productIds: getFavoriteIds() }),
      });
      if (favRes.ok) {
        const payload = (await favRes.json()) as { productIds: string[] };
        replaceFavorites(payload.productIds);
      }

      const deep = parseStartParam(
        data.startParam ?? WebApp.initDataUnsafe.start_param,
      );
      if (deep.type === "product" && deep.slug) {
        router.replace(`/tg/product/${deep.slug}`);
      } else if (deep.type === "category" && deep.slug) {
        router.replace(`/tg/category/${deep.slug}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка Telegram SDK");
    } finally {
      setReady(true);
    }
  }, [router]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void refreshAuth();
    }, 0);
    return () => window.clearTimeout(id);
  }, [refreshAuth]);

  const value = useMemo(
    () => ({ ready, user, error, isTelegram, refreshAuth }),
    [ready, user, error, isTelegram, refreshAuth],
  );

  return <TgContext.Provider value={value}>{children}</TgContext.Provider>;
}
