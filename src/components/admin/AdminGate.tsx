"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  ADMIN_PASSWORD,
  loginAdmin,
  logoutAdmin,
  useAdminAuth,
} from "@/store/admin-auth-store";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const { authenticated } = useAdminAuth();
  const [error, setError] = useState<string | null>(null);

  if (!authenticated) {
    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col justify-center px-4 py-10">
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-tm-ink">
          Админ-панель
        </h1>
        <p className="mb-6 text-sm text-tm-ink-muted">
          Вход для управления товарами, ценами и ассортиментом. Данные хранятся в
          браузере (мок до БД).
        </p>
        <form
          className="space-y-4 rounded-tm border border-tm-border bg-tm-surface-raised p-5"
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const password = String(new FormData(event.currentTarget).get("password") || "");
            if (!loginAdmin(password)) {
              setError("Неверный пароль");
              return;
            }
            setError(null);
          }}
        >
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium text-tm-ink">Пароль</span>
            <input
              name="password"
              type="password"
              required
              autoFocus
              className="h-11 w-full rounded-tm border border-tm-border bg-tm-surface px-3"
            />
          </label>
          {error ? (
            <p className="text-sm text-tm-danger" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className="inline-flex h-11 w-full items-center justify-center rounded-tm bg-tm-accent text-sm font-semibold text-white hover:bg-tm-accent-hover"
          >
            Войти
          </button>
          <p className="text-xs text-tm-ink-subtle">Демо-пароль: {ADMIN_PASSWORD}</p>
        </form>
        <Link href="/" className="mt-4 text-sm text-tm-accent">
          На сайт
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-tm-surface text-tm-ink">
      <header className="border-b border-tm-border bg-tm-surface-raised">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/admin" className="font-bold tracking-tight">
              Techno<span className="text-tm-accent">Admin</span>
            </Link>
            <nav className="flex gap-3 text-sm">
              <Link href="/admin/products" className="text-tm-ink-muted hover:text-tm-accent">
                Товары
              </Link>
              <Link href="/" className="text-tm-ink-muted hover:text-tm-accent">
                Витрина
              </Link>
            </nav>
          </div>
          <button
            type="button"
            onClick={() => logoutAdmin()}
            className="text-sm font-medium text-tm-ink-muted hover:text-tm-danger"
          >
            Выйти
          </button>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
    </div>
  );
}
