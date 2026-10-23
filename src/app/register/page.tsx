"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { registerWithEmail } from "@/store/auth-store";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const result = await registerWithEmail(
      String(form.get("name") || ""),
      String(form.get("email") || ""),
      String(form.get("password") || ""),
    );
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/account");
    router.refresh();
  }

  return (
    <div className="tm-container py-6 md:py-8">
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: "Регистрация" },
        ]}
      />
      <div className="mx-auto max-w-md space-y-6">
        <h1 className="text-2xl font-bold tracking-tight text-tm-ink">Регистрация</h1>
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-tm border border-tm-border bg-tm-surface-raised p-5"
        >
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium text-tm-ink">Имя</span>
            <input
              name="name"
              required
              className="h-11 w-full rounded-tm border border-tm-border bg-tm-surface px-3 text-tm-ink"
            />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium text-tm-ink">Email</span>
            <input
              name="email"
              type="email"
              required
              className="h-11 w-full rounded-tm border border-tm-border bg-tm-surface px-3 text-tm-ink"
            />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium text-tm-ink">Пароль</span>
            <input
              name="password"
              type="password"
              required
              minLength={6}
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
            {pending ? "Создание…" : "Создать аккаунт"}
          </button>
        </form>
        <p className="text-sm text-tm-ink-muted">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="font-medium text-tm-accent">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
