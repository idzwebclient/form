export function sumMoneyLines(value: string): number {
  return value
    .split("\n")
    .reduce((sum, line) => sum + numberValue(line), 0);
}

export function numberValue(value: string): number {
  const match = value.replaceAll(",", "").match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) || 0 : 0;
}

export function decimal(value: string): string {
  if (!value.trim()) return "";
  return numberValue(value).toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function goldValue(value: string): string {
  return value.trim().replace(/(\d)\.00$/, "$1");
}

export function weight(value: string): string {
  const formatted = decimal(value);
  return formatted ? `${formatted}g` : "";
}

export function moneyValue(value: string): string {
  return value.trim() ? money(numberValue(value)) : "";
}

export function moneyLines(value: string): string {
  return value
    .split("\n")
    .map((line) => moneyValue(line))
    .filter(Boolean)
    .join("\n");
}

export function actualValue(value: string): string {
  if (!value.trim()) return "";
  const numbers = value.replaceAll(",", "").match(/\d+(?:\.\d+)?/g) ?? [];
  if (!numbers.length) return value.trim();

  let index = 0;
  const formatted = value.replace(/\d[\d,]*(?:\.\d+)?/g, () => decimal(numbers[index++]));
  if (/g\s*$/i.test(formatted)) return formatted.replace(/\s*g\s*$/i, "g");
  return numbers.length > 1 ? `${formatted.trim()}g` : formatted.trim();
}

export function money(value: number): string {
  return `RM ${value.toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
