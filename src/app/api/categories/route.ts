import { NextResponse } from "next/server";
import { getCategories } from "@/data/catalog";


export async function GET() {
  try {
    const items = await getCategories();
    return NextResponse.json({ items });
  } catch (error) {
    console.error("GET /api/categories", error);
    return NextResponse.json(
      { error: "Не удалось загрузить категории" },
      { status: 500 },
    );
  }
}
