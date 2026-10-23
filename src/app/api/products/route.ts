import { NextResponse } from "next/server";
import { getProducts } from "@/data/catalog";
import type { ProductSort } from "@/lib/types";


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get("sort") as ProductSort | null;
    const result = await getProducts({
      categorySlug: searchParams.get("category") ?? undefined,
      minPrice: numberOrUndef(searchParams.get("minPrice")),
      maxPrice: numberOrUndef(searchParams.get("maxPrice")),
      query: searchParams.get("q") ?? undefined,
      sort: sort ?? undefined,
      page: numberOrUndef(searchParams.get("page")),
      pageSize: numberOrUndef(searchParams.get("pageSize")),
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/products", error);
    return NextResponse.json(
      { error: "Не удалось загрузить товары" },
      { status: 500 },
    );
  }
}

function numberOrUndef(value: string | null): number | undefined {
  if (value == null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}
