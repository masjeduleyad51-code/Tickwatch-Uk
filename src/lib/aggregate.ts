import type { Sighting } from "@/types/sighting";

export const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

export interface MonthCount {
  month: number;
  label: string;
  count: number;
}

export interface YearCount {
  year: number;
  count: number;
}

export interface SeasonalQuery {
  /** "all" or a city name */
  city: string;
  /** "all" or a year */
  year: number | "all";
}

export function selectSightings(sightings: readonly Sighting[], q: SeasonalQuery): Sighting[] {
  return sightings.filter((s) => (q.city === "all" || s.city === q.city) && (q.year === "all" || s.year === q.year));
}

/** Always 12 entries, zeros included, so an empty month is visible rather than hidden. */
export function monthlyCounts(sightings: readonly Sighting[], q: SeasonalQuery): MonthCount[] {
  const counts = new Array<number>(12).fill(0);
  for (const s of selectSightings(sightings, q)) counts[s.month - 1] = (counts[s.month - 1] ?? 0) + 1;
  return counts.map((count, i) => ({ month: i + 1, label: MONTH_LABELS[i] ?? "", count }));
}

export function availableYears(sightings: readonly Sighting[]): number[] {
  return [...new Set(sightings.map((s) => s.year))].sort((a, b) => b - a);
}

export function availableCities(sightings: readonly Sighting[]): string[] {
  return [...new Set(sightings.map((s) => s.city))].sort((a, b) => a.localeCompare(b));
}

/** Contiguous year series (zeros for quiet years) for the activity timeline. */
export function yearlyCounts(sightings: readonly Sighting[], city: string): YearCount[] {
  const rows = sightings.filter((s) => city === "all" || s.city === city);
  if (rows.length === 0) return [];
  const years = rows.map((s) => s.year);
  const min = Math.min(...years);
  const max = Math.max(...years);
  const byYear = new Map<number, number>();
  for (const s of rows) byYear.set(s.year, (byYear.get(s.year) ?? 0) + 1);
  return Array.from({ length: max - min + 1 }, (_, i) => ({ year: min + i, count: byYear.get(min + i) ?? 0 }));
}

export function speciesBreakdown(sightings: readonly Sighting[]): Array<{ species: string; count: number }> {
  const map = new Map<string, number>();
  for (const s of sightings) map.set(s.species, (map.get(s.species) ?? 0) + 1);
  return [...map.entries()]
    .map(([species, count]) => ({ species, count }))
    .sort((a, b) => b.count - a.count || a.species.localeCompare(b.species));
}

export function peakMonth(months: readonly MonthCount[]): MonthCount | null {
  const best = months.reduce<MonthCount | null>((acc, m) => (m.count > (acc?.count ?? 0) ? m : acc), null);
  return best;
}
