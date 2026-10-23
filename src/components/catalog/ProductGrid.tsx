import { ProductCard } from "@/components/product/ProductCard";
import { EmptyState } from "@/components/ui/StateMessage";
import type { ProductCardData } from "@/lib/types";

type ProductGridProps = {
  products: ProductCardData[];
  emptyTitle?: string;
  emptyDescription?: string;
};

export function ProductGrid({
  products,
  emptyTitle = "Товары не найдены",
  emptyDescription = "Измените фильтры или сбросьте поиск.",
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionHref="/catalog"
        actionLabel="Весь каталог"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
