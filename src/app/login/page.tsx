"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { isGoogleAuthEnabled } from "@/lib/auth-public";
import { DEMO_AUTH_HINT } from "@/data/demo-auth";
import { loginWithEmail, loginWithGoogle } from "@/store/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const googleEnabled = isGoogleAuthEnabled();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const result = await loginWithEmail(
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
          { label: "Вход" },
        ]}
      />
      <div className="mx-auto max-w-md space-y-6">
        <h1 className="text-2xl font-bold tracking-tight text-tm-ink">Вход</h1>
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
              defaultValue={DEMO_AUTH_HINT.email}
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
              defaultValue={DEMO_AUTH_HINT.password}
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
            {pending ? "Вход…" : "Войти"}
          </button>
          <p className="text-xs leading-relaxed text-tm-ink-subtle">
            Демо: {DEMO_AUTH_HINT.email} / {DEMO_AUTH_HINT.password}
          </p>
        </form>

        {googleEnabled ? (
          <button
            type="button"
            onClick={() => void loginWithGoogle()}
            className="inline-flex h-11 w-full items-center justify-center rounded-tm border border-tm-border text-sm font-semibold text-tm-ink hover:border-tm-border-strong"
          >
            Войти через Google
          </button>
        ) : null}

        <p className="text-sm text-tm-ink-muted">
          Нет аккаунта?{" "}
          <Link href="/register" className="font-medium text-tm-accent">
            Регистрация
          </Link>
          {" · "}
          <Link href="/forgot-password" className="font-medium text-tm-accent">
            Забыли пароль
          </Link>
        </p>
      </div>
    </div>
  );
}
