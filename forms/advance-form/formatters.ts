export function numberValue(value: string | number): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number.parseFloat(value.replace(/RM/gi, "").replace(/,/g, "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function money(value: string | number): string {
  return `RM ${numberValue(value).toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function moneyValue(value: string): string {
  return value.trim() ? money(value) : "";
}

export function displayDate(value: string): string {
  if (!value) return "";
  const parts = value.split("-");
  return parts.length === 3 ? parts.reverse().join("/") : value;
}
