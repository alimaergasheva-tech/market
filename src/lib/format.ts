/** Форматирование цены UZS: целые сумы с пробелами. */
export function formatPriceUzs(priceUzs: number): string {
  return `${new Intl.NumberFormat("ru-RU").format(priceUzs)} сум`;
}

export type StockStatus = "in_stock" | "low" | "out";

export function getStockStatus(stock: number): StockStatus {
  if (stock <= 0) return "out";
  if (stock <= 5) return "low";
  return "in_stock";
}

export function formatStockLabel(stock: number): string {
  const status = getStockStatus(stock);
  if (status === "out") return "Нет в наличии";
  if (status === "low") return `Мало · ${stock} шт.`;
  return "В наличии";
}
