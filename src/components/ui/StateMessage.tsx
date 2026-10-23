import Link from "next/link";
import {
  CircleNotch,
  WarningCircle,
  Package,
} from "@phosphor-icons/react/dist/ssr";

type StateMessageProps = {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
};

export function LoadingState({ title = "Загрузка" }: { title?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-tm border border-tm-border bg-tm-surface-raised px-6 py-16 text-center"
      role="status"
      aria-live="polite"
    >
      <CircleNotch className="size-8 animate-spin text-tm-accent" weight="bold" aria-hidden />
      <p className="text-sm font-medium text-tm-ink-muted">{title}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: StateMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-tm border border-dashed border-tm-border-strong bg-tm-surface-raised px-6 py-16 text-center">
      <Package className="size-10 text-tm-ink-subtle" weight="duotone" aria-hidden />
      <div className="max-w-sm space-y-1">
        <h2 className="text-lg font-semibold tracking-tight text-tm-ink">{title}</h2>
        {description ? (
          <p className="text-sm leading-relaxed text-tm-ink-muted">{description}</p>
        ) : null}
      </div>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-2 inline-flex h-10 items-center justify-center rounded-tm bg-tm-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-tm-accent-hover active:scale-[0.98]"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function ErrorState({
  title,
  description,
  actionHref,
  actionLabel,
}: StateMessageProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-tm border border-tm-danger/30 bg-tm-surface-raised px-6 py-16 text-center"
      role="alert"
    >
      <WarningCircle className="size-10 text-tm-danger" weight="duotone" aria-hidden />
      <div className="max-w-sm space-y-1">
        <h2 className="text-lg font-semibold tracking-tight text-tm-ink">{title}</h2>
        {description ? (
          <p className="text-sm leading-relaxed text-tm-ink-muted">{description}</p>
        ) : null}
      </div>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-2 inline-flex h-10 items-center justify-center rounded-tm border border-tm-border bg-tm-surface-raised px-4 text-sm font-semibold text-tm-ink transition-colors hover:border-tm-border-strong active:scale-[0.98]"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
