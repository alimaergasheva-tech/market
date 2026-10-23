"use client";

import { createPersistedStore } from "@/lib/persisted-store";
import { getLiveProductById } from "@/store/catalog-store";
import type { CartItem } from "@/lib/types";

/** v2: productId = UUID из Neon (старые mock id несовместимы). */
const store = createPersistedStore<CartItem[]>("tm-cart-v2", []);

export function useCartItems() {
  return store.useStore();
}

export function getCartItems() {
  return store.getSnapshot();
}

export function addToCart(productId: string, quantity = 1) {
  const product = getLiveProductById(productId);
  if (!product || product.stock <= 0 || !product.isActive) return;

  store.setState((prev) => {
    const existing = prev.find((item) => item.productId === productId);
    if (existing) {
      const nextQty = Math.min(existing.quantity + quantity, product.stock);
      return prev.map((item) =>
        item.productId === productId ? { ...item, quantity: nextQty } : item,
      );
    }
    return [...prev, { productId, quantity: Math.min(quantity, product.stock) }];
  });
}

export function setCartQuantity(productId: string, quantity: number) {
  const product = getLiveProductById(productId);
  if (!product) return;

  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  const nextQty = Math.min(quantity, Math.max(1, product.stock));
  store.setState((prev) =>
    prev.map((item) =>
      item.productId === productId ? { ...item, quantity: nextQty } : item,
    ),
  );
}

export function removeFromCart(productId: string) {
  store.setState((prev) => prev.filter((item) => item.productId !== productId));
}

export function clearCart() {
  store.setState([]);
}

export function replaceCartItems(items: CartItem[]) {
  store.setState(items);
}

export function getCartQuantity(productId: string) {
  return store.getSnapshot().find((item) => item.productId === productId)?.quantity ?? 0;
}

export function getCartCount() {
  return store.getSnapshot().reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartSubtotalUzs() {
  return store.getSnapshot().reduce((sum, item) => {
    const product = getLiveProductById(item.productId);
    if (!product) return sum;
    return sum + product.priceUzs * item.quantity;
  }, 0);
}
