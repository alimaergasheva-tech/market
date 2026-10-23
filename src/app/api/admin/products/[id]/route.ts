import { NextResponse } from "next/server";
import {
  patchProductFields,
  removeProduct,
  upsertProduct,
  type ProductWriteInput,
} from "@/data/catalog-mutations";
import { adminUnauthorized, isAdminAuthorized } from "@/lib/admin-auth";


type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  if (!isAdminAuthorized(request)) return adminUnauthorized();
  const { id } = await context.params;

  try {
    const body = (await request.json()) as ProductWriteInput;
    const product = await upsertProduct({
      ...body,
      id,
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
    return NextResponse.json({ product });
  } catch (error) {
    console.error("PUT /api/admin/products/[id]", error);
    return NextResponse.json(
      { error: "Не удалось обновить товар" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!isAdminAuthorized(request)) return adminUnauthorized();
  const { id } = await context.params;

  try {
    const body = (await request.json()) as {
      priceUzs?: number;
      stock?: number;
      isActive?: boolean;
    };
    const product = await patchProductFields(id, body);
    if (!product) {
      return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (error) {
    console.error("PATCH /api/admin/products/[id]", error);
    return NextResponse.json(
      { error: "Не удалось обновить товар" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!isAdminAuthorized(request)) return adminUnauthorized();
  const { id } = await context.params;

  try {
    await removeProduct(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/admin/products/[id]", error);
    return NextResponse.json(
      { error: "Не удалось удалить товар" },
      { status: 500 },
    );
  }
}
