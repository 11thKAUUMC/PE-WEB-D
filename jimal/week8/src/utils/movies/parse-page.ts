export function parsePage(value: unknown): number {
  const page = typeof value === "number" || typeof value === "string" ? Number(value) : NaN;
  return Number.isInteger(page) && page >= 1 && page <= 500 ? page : 1;
}
