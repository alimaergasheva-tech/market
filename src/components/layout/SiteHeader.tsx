"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Heart,
  List,
  MagnifyingGlass,
  Scales,
  ShoppingCart,
  User,
} from "@phosphor-icons/react";
import { useAuth } from "@/store/auth-store";
import { useCartItems } from "@/store/cart-store";
import { useCompareIds } from "@/store/compare-store";
import { useFavoriteIds } from "@/store/favorites-store";
import { MobileNav } from "./MobileNav";
import { NAV_CATEGORIES } from "./nav-data";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const cartItems = useCartItems();
  const favoriteIds = useFavoriteIds();
  const compareIds = useCompareIds();

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-tm-border bg-tm-surface-raised/95 backdrop-blur-md">
        <div className="tm-container">
          <div className="flex h-16 items-center gap-3 md:gap-4">
            <Link
              href="/"
              className="shrink-0 text-lg font-bold tracking-tight text-tm-ink"
            >
              Techno<span className="text-tm-accent">Market</span>
            </Link>

            <form
              role="search"
              className="hidden min-w-0 flex-1 md:block"
              action="/catalog"
              method="get"
            >
              <label className="sr-only" htmlFor="header-search">
                Поиск товаров
              </label>
              <div className="relative">
                <MagnifyingGlass
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-tm-ink-subtle"
                  weight="bold"
                  aria-hidden
                />
                <input
                  id="header-search"
                  type="search"
                  name="q"
                  placeholder="Найти технику"
                  className="h-10 w-full rounded-tm border border-tm-border bg-tm-surface pr-3 pl-9 text-sm text-tm-ink placeholder:text-tm-ink-subtle transition-colors focus:border-tm-accent"
                />
              </div>
            </form>

            <nav
              aria-label="Быстрые действия"
              className="ml-auto flex items-center gap-0.5 sm:gap-1"
            >
              <HeaderIconLink href="/compare" label="Сравнение" count={compareIds.length}>
                <Scales className="size-5" weight="bold" />
              </HeaderIconLink>
              <HeaderIconLink
                href="/favorites"
                label="Избранное"
                count={favoriteIds.length}
              >
                <Heart className="size-5" weight="bold" />
              </HeaderIconLink>
              <HeaderIconLink href="/cart" label="Корзина" count={cartCount}>
                <ShoppingCart className="size-5" weight="bold" />
              </HeaderIconLink>
              <HeaderIconLink
                href={user ? "/account" : "/login"}
                label={user ? "Аккаунт" : "Вход"}
                className="hidden sm:inline-flex"
              >
                <User className="size-5" weight="bold" />
              </HeaderIconLink>
              <button
                type="button"
                className="inline-flex size-10 items-center justify-center rounded-tm-sm text-tm-ink transition-colors hover:bg-tm-surface lg:hidden"
                aria-label="Открыть меню"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(true)}
              >
                <List className="size-5" weight="bold" />
              </button>
            </nav>
          </div>

          <form
            role="search"
            className="pb-3 md:hidden"
            action="/catalog"
            method="get"
          >
            <label className="sr-only" htmlFor="header-search-mobile">
              Поиск товаров
            </label>
            <div className="relative">
              <MagnifyingGlass
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-tm-ink-subtle"
                weight="bold"
                aria-hidden
              />
              <input
                id="header-search-mobile"
                type="search"
                name="q"
                placeholder="Найти технику"
                className="h-10 w-full rounded-tm border border-tm-border bg-tm-surface pr-3 pl-9 text-sm text-tm-ink placeholder:text-tm-ink-subtle"
              />
            </div>
          </form>

          <nav
            aria-label="Категории"
            className="hidden border-t border-tm-border lg:block"
          >
            <ul className="flex h-11 items-center gap-1">
              <li>
                <Link
                  href="/catalog"
                  className="inline-flex h-9 items-center rounded-tm-sm px-3 text-sm font-medium text-tm-ink transition-colors hover:bg-tm-surface hover:text-tm-accent"
                >
                  Каталог
                </Link>
              </li>
              {NAV_CATEGORIES.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex h-9 items-center rounded-tm-sm px-3 text-sm font-medium text-tm-ink-muted transition-colors hover:bg-tm-surface hover:text-tm-accent"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

function HeaderIconLink({
  href,
  label,
  children,
  className = "",
  count,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
  className?: string;
  count?: number;
}) {
  return (
    <Link
      href={href}
      aria-label={count && count > 0 ? `${label}: ${count}` : label}
      title={label}
      className={`relative inline-flex size-10 items-center justify-center rounded-tm-sm text-tm-ink transition-colors hover:bg-tm-surface hover:text-tm-accent ${className}`}
    >
      {children}
      {count && count > 0 ? (
        <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-tm-accent px-1 text-[10px] font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
