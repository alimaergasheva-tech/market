import Link from "next/link";

type CatalogPaginationProps = {
  basePath: string;
  queryString: string;
  page: number;
  totalPages: number;
  total: number;
};

export function CatalogPagination({
  basePath,
  queryString,
  page,
  totalPages,
  total,
}: CatalogPaginationProps) {
  if (totalPages <= 1) {
    return (
      <p className="mt-6 text-sm text-tm-ink-muted">
        Найдено: {total}
      </p>
    );
  }

  const params = new URLSearchParams(queryString);
  params.delete("page");

  function hrefFor(nextPage: number) {
    const next = new URLSearchParams(params);
    if (nextPage > 1) next.set("page", String(nextPage));
    const qs = next.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-tm-ink-muted">
        Страница {page} из {totalPages} · найдено {total}
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link
            href={hrefFor(page - 1)}
            className="inline-flex h-10 items-center rounded-tm border border-tm-border px-4 text-sm font-semibold text-tm-ink hover:border-tm-border-strong"
          >
            Назад
          </Link>
        ) : null}
        {page < totalPages ? (
          <Link
            href={hrefFor(page + 1)}
            className="inline-flex h-10 items-center rounded-tm bg-tm-accent px-4 text-sm font-semibold text-white hover:bg-tm-accent-hover"
          >
            Показать ещё
          </Link>
        ) : null}
      </div>
    </div>
  );
}
