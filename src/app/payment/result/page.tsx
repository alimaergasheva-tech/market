import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { LoadingState } from "@/components/ui/StateMessage";
import { firstParam } from "@/lib/catalog-params";

export const metadata: Metadata = {
  title: "Результат оплаты",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function PaymentResultInner({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = firstParam(params.status) ?? "error";
  const order = firstParam(params.order);
  const success = status === "success";

  return (
    <div className="tm-container py-6 md:py-8">
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: "Результат оплаты" },
        ]}
      />
      <div className="mx-auto max-w-lg space-y-5 rounded-tm border border-tm-border bg-tm-surface-raised p-6 text-center">
        <p className="text-xs font-medium text-tm-warning">
          Тестовая оплата · реальные деньги не списывались
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-tm-ink">
          {success ? "Заказ принят" : "Оплата не прошла"}
        </h1>
        <p className="text-sm leading-relaxed text-tm-ink-muted">
          {success
            ? "Статус paid выставлен сервером (simulate/webhook). Параметр в URL сам по себе оплату не подтверждает."
            : "Попробуйте оформить заказ снова. Данные карт мы не запрашиваем и не храним."}
        </p>
        {order ? (
          <p className="text-sm text-tm-ink">
            Номер заказа: <span className="font-semibold">{order}</span>
          </p>
        ) : null}
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          <Link
            href="/catalog"
            className="inline-flex h-11 items-center rounded-tm bg-tm-accent px-5 text-sm font-semibold text-white hover:bg-tm-accent-hover"
          >
            В каталог
          </Link>
          {!success ? (
            <Link
              href="/cart"
              className="inline-flex h-11 items-center rounded-tm border border-tm-border px-5 text-sm font-semibold text-tm-ink hover:border-tm-border-strong"
            >
              В корзину
            </Link>
          ) : (
            <Link
              href="/"
              className="inline-flex h-11 items-center rounded-tm border border-tm-border px-5 text-sm font-semibold text-tm-ink hover:border-tm-border-strong"
            >
              На главную
            </Link>
          )}
        </div>
        <p className="text-xs text-tm-ink-subtle">
          Для проверки ошибки откройте{" "}
          <Link href="/payment/result?status=error" className="text-tm-accent">
            /payment/result?status=error
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function PaymentResultPage(props: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="tm-container py-16">
          <LoadingState title="Загрузка результата" />
        </div>
      }
    >
      <PaymentResultInner {...props} />
    </Suspense>
  );
}
