"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { logout, useAuth } from "@/store/auth-store";

type OrderRow = {
  id: string;
  status: string;
  total: number;
  createdAt: string;
};

export default function AccountPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRow[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    void fetch("/api/orders")
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data: { items?: OrderRow[] }) => setOrders(data.items ?? []))
      .catch(() => setOrders([]));
  }, [user]);

  if (loading || !user) {
    return (
      <div className="tm-container py-16 text-center text-sm text-tm-ink-muted">
        {loading ? "Загрузка…" : "Перенаправление на вход…"}
      </div>
    );
  }

  return (
    <div className="tm-container py-6 md:py-8">
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: "Аккаунт" },
        ]}
      />
      <div className="mx-auto max-w-lg space-y-6">
        <h1 className="text-2xl font-bold tracking-tight text-tm-ink">Аккаунт</h1>
        <div className="space-y-3 rounded-tm border border-tm-border bg-tm-surface-raised p-5">
          <p className="text-sm text-tm-ink-muted">Имя</p>
          <p className="font-semibold text-tm-ink">{user.name}</p>
          <p className="text-sm text-tm-ink-muted">Email</p>
          <p className="font-semibold text-tm-ink">{user.email}</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-tm-ink">Мои заказы</h2>
          {orders.length === 0 ? (
            <p className="text-sm text-tm-ink-muted">Заказов пока нет.</p>
          ) : (
            <ul className="divide-y divide-tm-border rounded-tm border border-tm-border bg-tm-surface-raised">
              {orders.map((order) => (
                <li key={order.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium text-tm-ink">{order.id.slice(0, 8)}…</p>
                    <p className="text-tm-ink-muted">{order.status}</p>
                  </div>
                  <Link
                    href={`/api/orders/${order.id}`}
                    className="text-tm-accent hover:text-tm-accent-hover"
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(`/payment/result?order=${order.id}&status=${order.status === "paid" ? "success" : "pending"}`);
                    }}
                  >
                    Открыть
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/cart"
            className="inline-flex h-10 items-center rounded-tm border border-tm-border px-4 text-sm font-semibold text-tm-ink hover:border-tm-border-strong"
          >
            Корзина
          </Link>
          <button
            type="button"
            onClick={() => {
              void logout().then(() => {
                router.push("/");
                router.refresh();
              });
            }}
            className="inline-flex h-10 items-center rounded-tm bg-tm-accent px-4 text-sm font-semibold text-white hover:bg-tm-accent-hover"
          >
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
}
