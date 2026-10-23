import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingState } from "@/components/ui/StateMessage";
import { ProductPageView } from "@/components/product/ProductPageView";
import { getAllProducts, getProductBySlug } from "@/data/catalog";


type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const products = await getAllProducts();
    return products.map((product) => ({ slug: product.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Товар" };
  return {
    title: product.name,
    description: product.description,
  };
}

async function ProductInner({ params }: PageProps) {
  const { slug } = await params;
  return <ProductPageView slug={slug} />;
}

export default function ProductPage(props: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="tm-container py-16">
          <LoadingState title="Загрузка товара" />
        </div>
      }
    >
      <ProductInner {...props} />
    </Suspense>
  );
}
