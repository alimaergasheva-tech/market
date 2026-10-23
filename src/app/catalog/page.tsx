import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogPageContent } from "@/components/catalog/CatalogPageContent";
import { LoadingState } from "@/components/ui/StateMessage";

export const metadata: Metadata = {
  title: "Каталог",
  description:
    "Каталог техники Techno Market: смартфоны, ноутбуки, телевизоры и бытовая техника.",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function CatalogInner({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <CatalogPageContent
      title="Каталог"
      description="Все товары магазина. Фильтруйте по цене и характеристикам."
      basePath="/catalog"
      searchParams={params}
      breadcrumbs={[
        { label: "Главная", href: "/" },
        { label: "Каталог" },
      ]}
    />
  );
}

export default function CatalogPage(props: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="tm-container py-16">
          <LoadingState title="Загрузка каталога" />
        </div>
      }
    >
      <CatalogInner {...props} />
    </Suspense>
  );
}
