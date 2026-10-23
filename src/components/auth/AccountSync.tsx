"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { createPersistedStore } from "@/lib/persisted-store";
import { getCartItems, replaceCartItems } from "@/store/cart-store";
import { getFavoriteIds, replaceFavorites } from "@/store/favorites-store";

const syncedStore = createPersistedStore<{ userId: string | null }>(
  "tm-account-synced",
  { userId: null },
);

/** После входа: merge гостевой корзины/избранного в Neon и подтянуть снимок. */
export function AccountSync() {
  const { data, status } = useSession();
  const running = useRef(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      syncedStore.setState({ userId: null });
      return;
    }
    if (status !== "authenticated" || !data?.user?.id || running.current) return;
    if (syncedStore.getSnapshot().userId === data.user.id) return;

    running.current = true;
    const userId = data.user.id;
    const localCart = getCartItems();
    const localFavs = getFavoriteIds();

    void (async () => {
      try {
        const cartRes = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: localCart }),
        });
        if (cartRes.ok) {
          const payload = (await cartRes.json()) as {
            items: { productId: string; quantity: number }[];
          };
          replaceCartItems(payload.items);
        }

        const favRes = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productIds: localFavs }),
        });
        if (favRes.ok) {
          const payload = (await favRes.json()) as { productIds: string[] };
          replaceFavorites(payload.productIds);
        }

        syncedStore.setState({ userId });
      } catch (error) {
        console.error("AccountSync", error);
      } finally {
        running.current = false;
      }
    })();
  }, [status, data?.user?.id]);

  return null;
}
