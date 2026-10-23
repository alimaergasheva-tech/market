"use client";

import { createPersistedStore } from "@/lib/persisted-store";

const store = createPersistedStore<string[]>("tm-favorites-v2", []);

export function useFavoriteIds() {
  return store.useStore();
}

export function getFavoriteIds() {
  return store.getSnapshot();
}

export function isFavorite(productId: string) {
  return store.getSnapshot().includes(productId);
}

export function toggleFavorite(productId: string) {
  store.setState((prev) =>
    prev.includes(productId)
      ? prev.filter((id) => id !== productId)
      : [...prev, productId],
  );
}

export function removeFavorite(productId: string) {
  store.setState((prev) => prev.filter((id) => id !== productId));
}

export function clearFavorites() {
  store.setState([]);
}

export function replaceFavorites(ids: string[]) {
  store.setState([...new Set(ids)]);
}
