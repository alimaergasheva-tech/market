"use client";

import Link from "next/link";
import { formatPriceUzs } from "@/lib/format";
import { useAdminAuth } from "@/store/admin-auth-store";
import { useCatalogState } from "@/store/catalog-store";

export default function AdminDashboardPage() {
  const { authenticated } = useAdminAuth();
  const { products } = useCatalogState();

  if (!authenticated) return null;

  const active = products.filter((p) => p.isActive).length;
  const outOfStock = products.filter((p) => p.stock <= 0).length;
  const avgPrice =
    products.length === 0
      ? 0
      : Math.round(
          products.reduce((sum, p) => sum + p.priceUzs, 0) / products.length,
        );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Панель управления</h1>
        <p className="mt-1 text-sm text-tm-ink-muted">
          Цены и ассортимент пишутся в Neon и сразу видны на витрине.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Товаров" value={String(products.length)} />
        <Stat label="На витрине" value={String(active)} />
        <Stat label="Нет в наличии" value={String(outOfStock)} />
      </div>

      <p className="text-sm text-tm-ink-muted">
        Средняя цена: <span className="font-semibold text-tm-ink">{formatPriceUzs(avgPrice)}</span>
      </p>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/products"
          className="inline-flex h-11 items-center rounded-tm bg-tm-accent px-5 text-sm font-semibold text-white hover:bg-tm-accent-hover"
        >
          Управление товарами
        </Link>
        <Link
          href="/admin/products/new"
          className="inline-flex h-11 items-center rounded-tm border border-tm-border px-5 text-sm font-semibold"
        >
          Добавить товар
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-tm border border-tm-border bg-tm-surface-raised p-4">
      <p className="text-xs text-tm-ink-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
    </div>
  );
}
