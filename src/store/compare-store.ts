"use client";

import { createPersistedStore } from "@/lib/persisted-store";

export const MAX_COMPARE = 4;

const store = createPersistedStore<string[]>("tm-compare-v2", []);

export function useCompareIds() {
  return store.useStore();
}

export function isInCompare(productId: string) {
  return store.getSnapshot().includes(productId);
}

export type CompareToggleResult = "added" | "removed" | "limit";

export function toggleCompare(productId: string): CompareToggleResult {
  const current = store.getSnapshot();

  if (current.includes(productId)) {
    store.setState(current.filter((id) => id !== productId));
    return "removed";
  }

  if (current.length >= MAX_COMPARE) {
    return "limit";
  }

  store.setState([...current, productId]);
  return "added";
}

export function removeFromCompare(productId: string) {
  store.setState((prev) => prev.filter((id) => id !== productId));
}

export function clearCompare() {
  store.setState([]);
}
