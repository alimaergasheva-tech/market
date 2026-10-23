"use client";

const TOKEN_KEY = "tm-tg-token";

export function getTelegramToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setTelegramToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
}

/** fetch с Bearer-токеном Mini App (если есть). */
export async function tgFetch(input: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const token = getTelegramToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(input, { ...init, headers });
}

/** Парсинг startapp: product_<slug> | category_<slug> | c_<slug> | p_<slug> */
export function parseStartParam(startParam: string | null | undefined): {
  type: "product" | "category" | null;
  slug: string | null;
} {
  if (!startParam) return { type: null, slug: null };
  const value = startParam.trim();
  if (value.startsWith("product_")) {
    return { type: "product", slug: value.slice("product_".length) };
  }
  if (value.startsWith("p_")) {
    return { type: "product", slug: value.slice(2) };
  }
  if (value.startsWith("category_")) {
    return { type: "category", slug: value.slice("category_".length) };
  }
  if (value.startsWith("c_")) {
    return { type: "category", slug: value.slice(2) };
  }
  return { type: null, slug: null };
}
