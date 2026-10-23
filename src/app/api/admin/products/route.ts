import { NextResponse } from "next/server";
import { upsertProduct, type ProductWriteInput } from "@/data/catalog-mutations";
import { adminUnauthorized, isAdminAuthorized } from "@/lib/admin-auth";


export async function POST(request: Request) {
  if (!isAdminAuthorized(request)) return adminUnauthorized();

  try {
    const body = (await request.json()) as ProductWriteInput;
    if (!body.name?.trim() || !body.slug?.trim() || !body.categoryId) {
      return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
    }
    const product = await upsertProduct({
      ...body,
      id: undefined,
      name: body.name.trim(),
      slug: body.slug.trim(),
      description: body.description?.trim() ?? "",
      priceUzs: Math.max(0, Math.round(Number(body.priceUzs) || 0)),
      stock: Math.max(0, Math.round(Number(body.stock) || 0)),
      isActive: body.isActive !== false,
      popularity: Math.round(Number(body.popularity) || 0),
      images: body.images ?? [],
      attributes: body.attributes ?? [],
    });
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/products", error);
    return NextResponse.json(
      { error: "Не удалось создать товар" },
      { status: 500 },
    );
  }
}
