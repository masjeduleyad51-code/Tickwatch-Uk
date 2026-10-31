import type { Sighting } from "@/types/sighting";

export type Severity = "low" | "medium" | "high";
export type DatePreset = "all" | "30d" | "90d" | "12m" | "3y" | "custom";

export interface Filters {
  datePreset: DatePreset;
  /** yyyy-mm-dd, only used when datePreset is "custom" */
  from: string;
  to: string;
  species: string; // "all" or a common species name
  severity: Severity | "all";
  /** Only sightings from the last RECENT_DAYS days of the dataset. */
  recentOnly: boolean;
}

export const DEFAULT_FILTERS: Filters = {
  datePreset: "all",
  from: "",
  to: "",
  species: "all",
  severity: "all",
  recentOnly: false,
};

export const RECENT_DAYS = 14;
const DAY = 86_400_000;

export const DATE_PRESETS: ReadonlyArray<{ value: DatePreset; label: string }> = [
  { value: "all", label: "All time" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "12m", label: "Last 12 months" },
  { value: "3y", label: "Last 3 years" },
  { value: "custom", label: "Custom range…" },
];

export const SEVERITY_LABEL: Record<Severity, string> = { low: "Low", medium: "Medium", high: "High" };

/** The dataset ends in 2024, so "last 30 days" is anchored to the newest sighting, not today. */
export function datasetEnd(sightings: readonly Sighting[]): number | null {
  let end: number | null = null;
  for (const s of sightings) if (end === null || s.timestamp > end) end = s.timestamp;
  return end;
}

export function isRecent(timestamp: number, end: number | null): boolean {
  return end !== null && timestamp >= end - RECENT_DAYS * DAY && timestamp <= end;
}

function parseDay(value: string, endOfDay: boolean): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const t = Date.parse(`${value}T00:00:00Z`);
  return Number.isNaN(t) ? null : t + (endOfDay ? DAY - 1 : 0);
}

export interface DateWindow {
  from: number | null;
  to: number | null;
}

export function dateWindow(filters: Filters, end: number | null): DateWindow {
  if (filters.datePreset === "custom") {
    return { from: parseDay(filters.from, false), to: parseDay(filters.to, true) };
  }
  if (end === null || filters.datePreset === "all") return { from: null, to: null };
  const span: Record<Exclude<DatePreset, "all" | "custom">, number> = {
    "30d": 30 * DAY,
    "90d": 90 * DAY,
    "12m": 365 * DAY,
    "3y": 3 * 365 * DAY,
  };
  return { from: end - span[filters.datePreset], to: end };
}

/** True when a custom range is set but from is after to. */
export function isInvalidCustomRange(filters: Filters): boolean {
  if (filters.datePreset !== "custom") return false;
  const { from, to } = dateWindow(filters, null);
  return from !== null && to !== null && from > to;
}

/** Date, species and recent-only filters. Severity belongs to cities, so it is applied later. */
export function filterSightings(
  sightings: readonly Sighting[],
  filters: Filters,
  end: number | null = datasetEnd(sightings),
): Sighting[] {
  const { from, to } = dateWindow(filters, end);
  return sightings.filter((s) => {
    if (from !== null && s.timestamp < from) return false;
    if (to !== null && s.timestamp > to) return false;
    if (filters.species !== "all" && s.species !== filters.species) return false;
    if (filters.recentOnly && !isRecent(s.timestamp, end)) return false;
    return true;
  });
}

export interface CityStat {
  city: string;
  coordinates: Sighting["coordinates"];
  count: number;
  lastTimestamp: number;
  recentCount: number;
  topSpecies: string;
  severity: Severity;
}

/**
 * Severity is DERIVED, not from the API: cities are ranked by sighting count in the
 * current view and split into thirds (top = high, middle = medium, bottom = low).
 * Cities tied on count always share a level.
 */
export function assignSeverity(counts: readonly number[]): Severity[] {
  const n = counts.length;
  const sorted = [...counts].sort((a, b) => b - a);
  return counts.map((c) => {
    const firstIndex = sorted.indexOf(c);
    const pct = firstIndex / n;
    return pct < 1 / 3 ? "high" : pct < 2 / 3 ? "medium" : "low";
  });
}

export function buildCityStats(sightings: readonly Sighting[], end: number | null): CityStat[] {
  const groups = new Map<string, Sighting[]>();
  for (const s of sightings) {
    const list = groups.get(s.city);
    if (list) list.push(s);
    else groups.set(s.city, [s]);
  }
  const draft = [...groups.entries()].map(([city, list]) => {
    const speciesCount = new Map<string, number>();
    let last = 0;
    let recent = 0;
    for (const s of list) {
      speciesCount.set(s.species, (speciesCount.get(s.species) ?? 0) + 1);
      if (s.timestamp > last) last = s.timestamp;
      if (isRecent(s.timestamp, end)) recent += 1;
    }
    const top = [...speciesCount.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
    return {
      city,
      coordinates: list[0]?.coordinates ?? null,
      count: list.length,
      lastTimestamp: last,
      recentCount: recent,
      topSpecies: top?.[0] ?? "",
    };
  });
  const severities = assignSeverity(draft.map((d) => d.count));
  return draft
    .map((d, i) => ({ ...d, severity: severities[i] ?? "low" }))
    .sort((a, b) => b.count - a.count || a.city.localeCompare(b.city));
}

export interface FilteredView {
  /** Sightings that pass every filter, newest first. */
  sightings: Sighting[];
  cities: CityStat[];
  end: number | null;
}

/** Single entry point used by the map AND the results list so they can never disagree. */
export function applyFilters(all: readonly Sighting[], filters: Filters): FilteredView {
  const end = datasetEnd(all);
  const byDate = filterSightings(all, filters, end);
  const allCities = buildCityStats(byDate, end);
  const cities = filters.severity === "all" ? allCities : allCities.filter((c) => c.severity === filters.severity);
  const visible = new Set(cities.map((c) => c.city));
  return { sightings: byDate.filter((s) => visible.has(s.city)), cities, end };
}

export function activeFilterCount(f: Filters): number {
  return [f.datePreset !== "all", f.species !== "all", f.severity !== "all", f.recentOnly].filter(Boolean).length;
}
