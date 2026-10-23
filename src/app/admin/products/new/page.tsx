"use client";

import { ProductForm } from "@/components/admin/ProductForm";
import { useAdminAuth } from "@/store/admin-auth-store";
import { createEmptyProduct, useCatalogState } from "@/store/catalog-store";

export default function AdminNewProductPage() {
  const { authenticated } = useAdminAuth();
  const { categories } = useCatalogState();

  if (!authenticated) return null;

  const initial = createEmptyProduct(categories[0]?.id ?? "cat-smartfony");

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight">Новый товар</h1>
      <ProductForm initial={initial} mode="create" />
    </div>
  );
}
