import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui/StateMessage";
import { HomeShowcase } from "@/components/catalog/HomeShowcase";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="tm-container py-6 md:py-8">
      <Breadcrumbs items={[{ label: "Главная" }]} />

      <section className="relative mb-10 overflow-hidden rounded-tm border border-tm-border bg-tm-surface-raised/80 backdrop-blur-md">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 100% 0%, var(--tm-accent-soft), transparent 55%), linear-gradient(135deg, color-mix(in srgb, var(--tm-surface-raised) 80%, transparent), transparent)",
          }}
          aria-hidden
        />
        <div className="relative grid gap-6 px-5 py-8 md:grid-cols-[1.2fr_0.8fr] md:items-end md:px-8 md:py-10">
          <div className="max-w-xl space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-tm-ink md:text-4xl">
              Techno Market
            </h1>
            <p className="max-w-[40ch] text-base leading-relaxed text-tm-ink-muted">
              Техника с понятными ценами в сумах. Ассортимент и цены можно менять в
              админ-панели.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                href="/catalog"
                className="inline-flex h-11 items-center justify-center rounded-tm bg-tm-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-tm-accent-hover active:scale-[0.98]"
              >
                Открыть каталог
              </Link>
              <Link
                href="/admin"
                className="inline-flex h-11 items-center justify-center rounded-tm border border-tm-border bg-tm-surface-raised px-5 text-sm font-semibold text-tm-ink transition-colors hover:border-tm-border-strong active:scale-[0.98]"
              >
                Админ-панель
              </Link>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-tm-ink-muted md:text-right">
            Ташкент · UZS · демо без БД
          </p>
        </div>
      </section>

      <HomeShowcase />

      <section className="mb-8 space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-tm-ink">Состояния UI</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          <LoadingState title="Загрузка товаров" />
          <EmptyState
            title="Пока пусто"
            description="Добавьте товары в избранное из каталога."
            actionHref="/catalog"
            actionLabel="В каталог"
          />
          <ErrorState
            title="Не удалось загрузить"
            description="Проверьте соединение и откройте страницу снова."
            actionHref="/"
            actionLabel="На главную"
          />
        </div>
      </section>
    </div>
  );
}
