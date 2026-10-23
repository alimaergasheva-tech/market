import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CatalogPageContent } from "@/components/catalog/CatalogPageContent";
import { LoadingState } from "@/components/ui/StateMessage";
import { getCategories, getCategoryBySlug } from "@/data/catalog";


type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateStaticParams() {
  try {
    const categories = await getCategories();
    return categories.map((category) => ({ slug: category.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Категория" };
  return {
    title: category.name,
    description: category.description,
  };
}

async function CategoryInner({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const query = await searchParams;

  return (
    <CatalogPageContent
      title={category.name}
      description={category.description}
      basePath={`/category/${slug}`}
      categorySlug={slug}
      searchParams={query}
      breadcrumbs={[
        { label: "Главная", href: "/" },
        { label: "Каталог", href: "/catalog" },
        { label: category.name },
      ]}
    />
  );
}

export default function CategoryPage(props: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="tm-container py-16">
          <LoadingState title="Загрузка категории" />
        </div>
      }
    >
      <CategoryInner {...props} />
    </Suspense>
  );
}
