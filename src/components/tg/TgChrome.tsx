"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Heart,
  House,
  Scales,
  ShoppingCart,
  SquaresFour,
} from "@phosphor-icons/react";
import WebApp from "@twa-dev/sdk";
import { useTg } from "@/components/tg/TgProvider";
import { useCartItems } from "@/store/cart-store";
import { useCompareIds } from "@/store/compare-store";
import { useFavoriteIds } from "@/store/favorites-store";

const NAV = [
  { href: "/tg", label: "Главная", icon: House, match: (p: string) => p === "/tg" },
  {
    href: "/tg/catalog",
    label: "Каталог",
    icon: SquaresFour,
    match: (p: string) => p.startsWith("/tg/catalog") || p.startsWith("/tg/category"),
  },
  {
    href: "/tg/favorites",
    label: "Избранное",
    icon: Heart,
    match: (p: string) => p.startsWith("/tg/favorites"),
  },
  {
    href: "/tg/compare",
    label: "Сравнение",
    icon: Scales,
    match: (p: string) => p.startsWith("/tg/compare"),
  },
  {
    href: "/tg/cart",
    label: "Корзина",
    icon: ShoppingCart,
    match: (p: string) => p.startsWith("/tg/cart") || p.startsWith("/tg/checkout"),
  },
] as const;

export function TgChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, user, error, isTelegram } = useTg();
  const cartCount = useCartItems().reduce((s, i) => s + i.quantity, 0);
  const favCount = useFavoriteIds().length;
  const compareCount = useCompareIds().length;

  useEffect(() => {
    if (!isTelegram) return;
    const canGoBack =
      pathname !== "/tg" &&
      !pathname.endsWith("/tg") &&
      pathname.startsWith("/tg/");

    if (canGoBack) {
      WebApp.BackButton.show();
      const onBack = () => {
        if (window.history.length > 1) router.back();
        else router.push("/tg");
      };
      WebApp.BackButton.onClick(onBack);
      return () => {
        WebApp.BackButton.offClick(onBack);
        WebApp.BackButton.hide();
      };
    }
    WebApp.BackButton.hide();
  }, [pathname, router, isTelegram]);

  return (
    <div className="flex min-h-dvh flex-col bg-tm-surface text-tm-ink">
      <header className="sticky top-0 z-30 border-b border-tm-border bg-tm-surface-raised/95 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-base font-bold tracking-tight">
              Techno<span className="text-tm-accent">Market</span>
            </p>
            <p className="text-xs text-tm-ink-muted">
              {user ? user.name : isTelegram ? "Вход…" : "Превью вне Telegram"}
            </p>
          </div>
          {!ready ? (
            <span className="text-xs text-tm-ink-subtle">загрузка</span>
          ) : null}
        </div>
        {error ? (
          <p className="mt-2 text-xs text-tm-danger" role="alert">
            {error}
          </p>
        ) : null}
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-4 pb-24">
        {children}
      </main>

      <nav
        aria-label="Mini App"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-tm-border bg-tm-surface-raised/95 backdrop-blur-md"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5 gap-0.5 px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1">
          {NAV.map((item) => {
            const active = item.match(pathname);
            const Icon = item.icon;
            const badge =
              item.href === "/tg/cart"
                ? cartCount
                : item.href === "/tg/favorites"
                  ? favCount
                  : item.href === "/tg/compare"
                    ? compareCount
                    : 0;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={
                    active
                      ? "flex flex-col items-center gap-0.5 rounded-tm-sm px-1 py-2 text-tm-accent"
                      : "flex flex-col items-center gap-0.5 rounded-tm-sm px-1 py-2 text-tm-ink-muted"
                  }
                >
                  <span className="relative">
                    <Icon className="size-5" weight={active ? "fill" : "bold"} />
                    {badge > 0 ? (
                      <span className="absolute -top-1.5 -right-2 min-w-4 rounded-full bg-tm-accent px-1 text-[10px] font-bold text-white">
                        {badge > 99 ? "99+" : badge}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
