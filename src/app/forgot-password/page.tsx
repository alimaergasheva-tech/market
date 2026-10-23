"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(data?.error ?? "Не удалось отправить запрос");
        return;
      }
      setSent(true);
    } catch {
      setError("Сеть недоступна");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="tm-container py-6 md:py-8">
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: "Восстановление пароля" },
        ]}
      />
      <div className="mx-auto max-w-md space-y-6">
        <h1 className="text-2xl font-bold tracking-tight text-tm-ink">
          Восстановление пароля
        </h1>
        {sent ? (
          <div className="rounded-tm border border-tm-border bg-tm-surface-raised p-5 text-sm text-tm-ink-muted">
            Если такой email есть в системе, токен сброса создан. В локальной
            разработке ссылка пишется в лог сервера Next.js (отправка писем не
            подключена).
            <div className="mt-4">
              <Link href="/login" className="font-medium text-tm-accent">
                Вернуться ко входу
              </Link>
            </div>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="space-y-4 rounded-tm border border-tm-border bg-tm-surface-raised p-5"
          >
            <label className="block space-y-1.5 text-sm">
              <span className="font-medium text-tm-ink">Email</span>
              <input
                name="email"
                type="email"
                required
                className="h-11 w-full rounded-tm border border-tm-border bg-tm-surface px-3 text-tm-ink"
              />
            </label>
            {error ? (
              <p className="text-sm text-tm-danger" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-11 w-full items-center justify-center rounded-tm bg-tm-accent text-sm font-semibold text-white hover:bg-tm-accent-hover active:scale-[0.98] disabled:opacity-60"
            >
              {pending ? "Отправка…" : "Отправить ссылку"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
