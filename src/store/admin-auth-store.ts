"use client";

import { createPersistedStore } from "@/lib/persisted-store";

/** Пароль админки (совпадает с ADMIN_PASSWORD / дефолт admin123 на сервере). */
export const ADMIN_PASSWORD = "admin123";

type AdminAuthState = {
  authenticated: boolean;
  password: string | null;
};

const store = createPersistedStore<AdminAuthState>("tm-admin-auth-v2", {
  authenticated: false,
  password: null,
});

export function useAdminAuth() {
  return store.useStore();
}

export function isAdminAuthenticated() {
  return store.getSnapshot().authenticated;
}

export function getAdminPassword() {
  return store.getSnapshot().password;
}

export function loginAdmin(password: string): boolean {
  if (password === ADMIN_PASSWORD) {
    store.setState({ authenticated: true, password });
    return true;
  }
  return false;
}

export function logoutAdmin() {
  store.setState({ authenticated: false, password: null });
}
