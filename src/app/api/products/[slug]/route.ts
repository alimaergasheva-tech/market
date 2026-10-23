import { NextResponse } from "next/server";
import { getProductBySlug } from "@/data/catalog";


type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const product = await getProductBySlug(slug);
    if (!product) {
      return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (error) {
    console.error("GET /api/products/[slug]", error);
    return NextResponse.json(
      { error: "Не удалось загрузить товар" },
      { status: 500 },
    );
  }
}
