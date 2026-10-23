"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ResultInner() {
  const params = useSearchParams();
  const status = params.get("status") ?? "error";
  const order = params.get("order");
  const success = status === "success";

  return (
    <div className="space-y-4 rounded-tm border border-tm-border bg-tm-surface-raised p-5 text-center">
      <p className="text-xs font-medium text-tm-warning">
        Тестовая оплата · без списания
      </p>
      <h1 className="text-xl font-bold tracking-tight">
        {success ? "Заказ принят" : "Оплата не прошла"}
      </h1>
      <p className="text-sm text-tm-ink-muted">
        {success
          ? "Статус paid выставлен сервером (simulate/webhook)."
          : "Попробуйте оформить заказ снова."}
      </p>
      {order ? (
        <p className="break-all text-xs text-tm-ink-subtle">Заказ: {order}</p>
      ) : null}
      <div className="flex flex-wrap justify-center gap-2 pt-2">
        <Link
          href="/tg"
          className="inline-flex h-10 items-center rounded-tm bg-tm-accent px-4 text-sm font-semibold text-white"
        >
          На главную
        </Link>
        <Link
          href="/tg/catalog"
          className="inline-flex h-10 items-center rounded-tm border border-tm-border px-4 text-sm font-semibold"
        >
          Каталог
        </Link>
      </div>
    </div>
  );
}

export default function TgPaymentResultPage() {
  return (
    <Suspense
      fallback={
        <p className="py-10 text-center text-sm text-tm-ink-muted">Загрузка…</p>
      }
    >
      <ResultInner />
    </Suspense>
  );
}
