import { NextResponse } from "next/server";
import { getCatalogSnapshot } from "@/data/catalog";


/** Полный снимок каталога для витрины и админки. */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("all") === "1";
    const snapshot = await getCatalogSnapshot(includeInactive);
    return NextResponse.json(snapshot);
  } catch (error) {
    console.error("GET /api/catalog", error);
    return NextResponse.json(
      { error: "Не удалось загрузить каталог" },
      { status: 500 },
    );
  }
}
