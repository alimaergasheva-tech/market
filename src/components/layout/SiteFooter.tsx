import Link from "next/link";
import { NAV_CATEGORIES } from "./nav-data";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-tm-border bg-tm-surface-raised">
      <div className="tm-container grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <p className="text-base font-bold tracking-tight text-tm-ink">
            Techno<span className="text-tm-accent">Market</span>
          </p>
          <p className="max-w-xs text-sm leading-relaxed text-tm-ink-muted">
            Техника для дома и работы. Доставка по Ташкенту и Узбекистану.
          </p>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-tm-ink">Категории</p>
          <ul className="space-y-2">
            {NAV_CATEGORIES.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-tm-ink-muted transition-colors hover:text-tm-accent"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-tm-ink">Покупателям</p>
          <ul className="space-y-2">
            <li>
              <Link
                href="/cart"
                className="text-sm text-tm-ink-muted transition-colors hover:text-tm-accent"
              >
                Корзина
              </Link>
            </li>
            <li>
              <Link
                href="/favorites"
                className="text-sm text-tm-ink-muted transition-colors hover:text-tm-accent"
              >
                Избранное
              </Link>
            </li>
            <li>
              <Link
                href="/compare"
                className="text-sm text-tm-ink-muted transition-colors hover:text-tm-accent"
              >
                Сравнение
              </Link>
            </li>
            <li>
              <Link
                href="/login"
                className="text-sm text-tm-ink-muted transition-colors hover:text-tm-accent"
              >
                Вход
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-tm-border">
        <div className="tm-container flex flex-col gap-1 py-4 text-xs text-tm-ink-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Techno Market</p>
          <p>Цены в сумах (UZS). Оплата на сайте пока тестовая.</p>
        </div>
      </div>
    </footer>
  );
}
