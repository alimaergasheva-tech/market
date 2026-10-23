"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { Category, Product } from "@/lib/types";
import { getAdminPassword } from "@/store/admin-auth-store";

export type CatalogState = {
  products: Product[];
  categories: Category[];
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;
};

type Listener = () => void;

let state: CatalogState = {
  products: [],
  categories: [],
  status: "idle",
  error: null,
};
let loadPromise: Promise<void> | null = null;
const listeners = new Set<Listener>();

function emit() {
  for (const listener of listeners) listener();
}

function setState(next: CatalogState | ((prev: CatalogState) => CatalogState)) {
  state = typeof next === "function" ? next(state) : next;
  emit();
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

export function useCatalogState() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    void ensureCatalogLoaded();
  }, []);

  return snapshot;
}

export function getCatalogSnapshot(): CatalogState {
  return state;
}

export async function ensureCatalogLoaded(includeInactive = true) {
  if (state.status === "ready") return;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    setState((prev) => ({ ...prev, status: "loading", error: null }));
    try {
      const query = includeInactive ? "?all=1" : "";
      const res = await fetch(`/api/catalog${query}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Ошибка загрузки каталога");
      const data = (await res.json()) as {
        products: Product[];
        categories: Category[];
      };
      setState({
        products: data.products,
        categories: data.categories,
        status: "ready",
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        status: "error",
        error: error instanceof Error ? error.message : "Ошибка загрузки",
      }));
    } finally {
      loadPromise = null;
    }
  })();

  return loadPromise;
}

export async function refreshCatalog() {
  loadPromise = null;
  setState((prev) => ({ ...prev, status: "idle" }));
  await ensureCatalogLoaded(true);
}

export function getLiveProducts(includeInactive = false): Product[] {
  return includeInactive
    ? state.products
    : state.products.filter((p) => p.isActive);
}

export function getLiveProductById(id: string): Product | undefined {
  return state.products.find((p) => p.id === id);
}

export function getLiveProductBySlug(slug: string): Product | undefined {
  return state.products.find((p) => p.slug === slug && p.isActive);
}

export function getLiveCategories(): Category[] {
  return state.categories;
}

function adminHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-admin-password": getAdminPassword() ?? "",
  };
}

export async function saveProduct(product: Product) {
  const isNew =
    !product.id || !state.products.some((item) => item.id === product.id);
  const res = await fetch(
    isNew ? "/api/admin/products" : `/api/admin/products/${product.id}`,
    {
      method: isNew ? "POST" : "PUT",
      headers: adminHeaders(),
      body: JSON.stringify(product),
    },
  );
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "Не удалось сохранить товар");
  }
  const data = (await res.json()) as { product: Product };
  setState((prev) => {
    const index = prev.products.findIndex((item) => item.id === data.product.id);
    if (index === -1) {
      return { ...prev, products: [data.product, ...prev.products] };
    }
    const products = [...prev.products];
    products[index] = data.product;
    return { ...prev, products };
  });
  return data.product;
}

export async function deleteProduct(productId: string) {
  const res = await fetch(`/api/admin/products/${productId}`, {
    method: "DELETE",
    headers: adminHeaders(),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "Не удалось удалить товар");
  }
  setState((prev) => ({
    ...prev,
    products: prev.products.filter((item) => item.id !== productId),
  }));
}

export async function setProductActive(productId: string, isActive: boolean) {
  const res = await fetch(`/api/admin/products/${productId}`, {
    method: "PATCH",
    headers: adminHeaders(),
    body: JSON.stringify({ isActive }),
  });
  if (!res.ok) throw new Error("Не удалось изменить статус");
  const data = (await res.json()) as { product: Product };
  setState((prev) => ({
    ...prev,
    products: prev.products.map((item) =>
      item.id === productId ? data.product : item,
    ),
  }));
}

export async function updateProductPrice(productId: string, priceUzs: number) {
  const res = await fetch(`/api/admin/products/${productId}`, {
    method: "PATCH",
    headers: adminHeaders(),
    body: JSON.stringify({ priceUzs: Math.max(0, Math.round(priceUzs)) }),
  });
  if (!res.ok) throw new Error("Не удалось изменить цену");
  const data = (await res.json()) as { product: Product };
  setState((prev) => ({
    ...prev,
    products: prev.products.map((item) =>
      item.id === productId ? data.product : item,
    ),
  }));
}

export async function updateProductStock(productId: string, stock: number) {
  const res = await fetch(`/api/admin/products/${productId}`, {
    method: "PATCH",
    headers: adminHeaders(),
    body: JSON.stringify({ stock: Math.max(0, Math.round(stock)) }),
  });
  if (!res.ok) throw new Error("Не удалось изменить остаток");
  const data = (await res.json()) as { product: Product };
  setState((prev) => ({
    ...prev,
    products: prev.products.map((item) =>
      item.id === productId ? data.product : item,
    ),
  }));
}

export function createEmptyProduct(categoryId: string): Product {
  return {
    id: "",
    categoryId,
    name: "Новый товар",
    slug: `novyy-tovar-${Date.now()}`,
    description: "Описание товара",
    priceUzs: 1_000_000,
    currency: "UZS",
    stock: 1,
    isActive: true,
    popularity: 50,
    createdAt: new Date().toISOString().slice(0, 10),
    images: [
      {
        url: "/products/smartphone.jpg",
        alt: "Новый товар",
        sortOrder: 0,
      },
    ],
    attributes: [{ name: "Бренд", value: "—", sortOrder: 0 }],
  };
}

export const PRODUCT_IMAGE_OPTIONS = [
  { label: "Смартфон 1", url: "/products/smartphone.jpg" },
  { label: "Смартфон 2", url: "/products/phone-2.jpg" },
  { label: "Смартфон 3", url: "/products/phone-3.jpg" },
  { label: "Ноутбук 1", url: "/products/laptop.jpg" },
  { label: "Ноутбук 2", url: "/products/laptop-2.jpg" },
  { label: "Ноутбук 3", url: "/products/laptop-3.jpg" },
  { label: "ТВ 1", url: "/products/tv.jpg" },
  { label: "ТВ 2", url: "/products/tv-2.jpg" },
  { label: "Стиралка", url: "/products/washer.jpg" },
  { label: "Пылесос", url: "/products/vacuum.jpg" },
  { label: "Холодильник", url: "/products/fridge.jpg" },
  { label: "Микроволновка", url: "/products/microwave.jpg" },
  { label: "Кондиционер", url: "/products/ac.jpg" },
] as const;
