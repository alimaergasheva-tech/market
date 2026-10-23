"use client";

import Link from "next/link";
import { X } from "@phosphor-icons/react";
import { NAV_CATEGORIES, NAV_LINKS } from "./nav-data";

type MobileNavProps = {
  open: boolean;
  onClose: () => void;
};

export function MobileNav({ open, onClose }: MobileNavProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/40"
        aria-label="Закрыть меню"
        onClick={onClose}
      />
      <div className="absolute inset-y-0 right-0 flex w-[min(100%,20rem)] flex-col bg-tm-surface-raised shadow-xl">
        <div className="flex h-16 items-center justify-between border-b border-tm-border px-4">
          <p className="text-sm font-semibold text-tm-ink">Меню</p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-10 items-center justify-center rounded-tm-sm text-tm-ink transition-colors hover:bg-tm-surface"
            aria-label="Закрыть"
          >
            <X className="size-5" weight="bold" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <p className="mb-2 text-xs font-medium text-tm-ink-subtle">Категории</p>
          <ul className="mb-6 space-y-1">
            {NAV_CATEGORIES.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="block rounded-tm-sm px-3 py-2.5 text-sm font-medium text-tm-ink hover:bg-tm-surface"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <p className="mb-2 text-xs font-medium text-tm-ink-subtle">Разделы</p>
          <ul className="space-y-1">
            {NAV_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="block rounded-tm-sm px-3 py-2.5 text-sm font-medium text-tm-ink hover:bg-tm-surface"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
