"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { DEMO_AUTH_HINT } from "@/data/demo-auth";

export const DEMO_CREDENTIALS = {
  email: DEMO_AUTH_HINT.email,
  password: DEMO_AUTH_HINT.password,
  name: "Демо Покупатель",
} as const;

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

export type AuthResult =
  | { ok: true; user: AuthUser }
  | { ok: false; error: string };

export function useAuth() {
  const { data, status } = useSession();
  const user: AuthUser | null =
    data?.user?.id && data.user.email
      ? {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name ?? data.user.email.split("@")[0] ?? "Покупатель",
        }
      : null;

  return {
    user,
    loading: status === "loading",
    status,
  };
}

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<AuthResult> {
  const result = await signIn("credentials", {
    email: email.trim().toLowerCase(),
    password,
    redirect: false,
  });

  if (result?.error) {
    return {
      ok: false,
      error: "Неверный email или пароль.",
    };
  }

  return {
    ok: true,
    user: {
      id: "session",
      email: email.trim().toLowerCase(),
      name: email.split("@")[0] ?? "Покупатель",
    },
  };
}

export async function registerWithEmail(
  name: string,
  email: string,
  password: string,
): Promise<AuthResult> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const data = (await res.json().catch(() => null)) as
    | { error?: string; user?: { id: string; email: string; name: string | null } }
    | null;

  if (!res.ok) {
    return {
      ok: false,
      error: data?.error ?? "Регистрация не удалась.",
    };
  }

  const login = await loginWithEmail(email, password);
  if (!login.ok) return login;

  return {
    ok: true,
    user: {
      id: data?.user?.id ?? "session",
      email: email.trim().toLowerCase(),
      name: name.trim(),
    },
  };
}

export async function logout() {
  await signOut({ redirect: false });
}

export async function loginWithGoogle() {
  await signIn("google", { callbackUrl: "/account" });
}
