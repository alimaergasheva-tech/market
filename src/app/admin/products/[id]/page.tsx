"use client";

import { useParams } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { useAdminAuth } from "@/store/admin-auth-store";
import { useCatalogState } from "@/store/catalog-store";

export default function AdminEditProductPage() {
  const { authenticated } = useAdminAuth();
  const params = useParams<{ id: string }>();
  const { products } = useCatalogState();
  const product = products.find((item) => item.id === params.id);

  if (!authenticated) return null;

  if (!product) {
    return (
      <p className="text-sm text-tm-danger">
        Товар не найден. Возможно, он был удалён.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight">Редактирование</h1>
      <ProductForm key={product.id} initial={product} mode="edit" />
    </div>
  );
}
