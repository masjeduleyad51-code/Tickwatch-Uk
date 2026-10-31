import { realSightings } from "@/test/realData";
import { DEFAULT_FILTERS, applyFilters, assignSeverity, datasetEnd, filterSightings, isInvalidCustomRange, isRecent, type Filters } from "./filters";

const f = (o: Partial<Filters>): Filters => ({ ...DEFAULT_FILTERS, ...o });
const DAY = 86_400_000;

describe("filters on the real dataset", () => {
  const end = datasetEnd(realSightings) ?? 0;

  it("anchors relative ranges to the newest sighting, not today", () => {
    expect(new Date(end).getUTCFullYear()).toBe(2024);
    const last30 = filterSightings(realSightings, f({ datePreset: "30d" }));
    expect(last30.length).toBeGreaterThan(0);
    expect(last30.every((s) => s.timestamp >= end - 30 * DAY)).toBe(true);
  });

  it("all-time returns everything; species narrows to exactly that species", () => {
    expect(filterSightings(realSightings, DEFAULT_FILTERS)).toHaveLength(1000);
    const marsh = filterSightings(realSightings, f({ species: "Marsh tick" }));
    expect(marsh).toHaveLength(186);
    expect(marsh.every((s) => s.species === "Marsh tick")).toBe(true);
  });

  it("custom range is inclusive of both end days", () => {
    const r = filterSightings(realSightings, f({ datePreset: "custom", from: "2020-01-01", to: "2020-12-31" }));
    expect(r.length).toBe(69);
    expect(r.every((s) => s.year === 2020)).toBe(true);
  });

  it("flags a custom range whose start is after its end", () => {
    expect(isInvalidCustomRange(f({ datePreset: "custom", from: "2021-01-01", to: "2020-01-01" }))).toBe(true);
    expect(filterSightings(realSightings, f({ datePreset: "custom", from: "2021-01-01", to: "2020-01-01" }))).toHaveLength(0);
  });

  it("recent-only keeps only the last 14 days of data", () => {
    const r = filterSightings(realSightings, f({ recentOnly: true }));
    expect(r.every((s) => isRecent(s.timestamp, end))).toBe(true);
    expect(r.length).toBeLessThan(40);
  });

  it("map cities and results list always agree, for every severity", () => {
    for (const severity of ["all", "low", "medium", "high"] as const) {
      const view = applyFilters(realSightings, f({ severity, datePreset: "12m" }));
      const cityTotal = view.cities.reduce((n, c) => n + c.count, 0);
      expect(cityTotal).toBe(view.sightings.length);
      if (severity !== "all") expect(view.cities.every((c) => c.severity === severity)).toBe(true);
    }
  });

  it("every one of the 14 cities gets a severity when unfiltered, split into thirds", () => {
    const { cities } = applyFilters(realSightings, DEFAULT_FILTERS);
    expect(cities).toHaveLength(14);
    const by = (s: string) => cities.filter((c) => c.severity === s).length;
    expect(by("high") + by("medium") + by("low")).toBe(14);
    expect(by("high")).toBeGreaterThanOrEqual(4);
    expect(Math.min(...cities.filter((c) => c.severity === "high").map((c) => c.count))).toBeGreaterThanOrEqual(
      Math.max(...cities.filter((c) => c.severity === "low").map((c) => c.count)),
    );
  });
});

describe("assignSeverity", () => {
  it("ranks into thirds and keeps ties together", () => {
    expect(assignSeverity([9, 8, 7, 3, 2, 1])).toEqual(["high", "high", "medium", "medium", "low", "low"]);
    expect(assignSeverity([5, 5, 5])).toEqual(["high", "high", "high"]);
    expect(assignSeverity([4])).toEqual(["high"]);
    expect(assignSeverity([])).toEqual([]);
  });
});
