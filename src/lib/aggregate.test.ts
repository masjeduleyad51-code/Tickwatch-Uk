import { realSightings } from "@/test/realData";
import { availableCities, availableYears, monthlyCounts, peakMonth, selectSightings, speciesBreakdown, yearlyCounts } from "./aggregate";

describe("aggregation on the real dataset", () => {
  it("monthly counts always have 12 months that sum to the selection", () => {
    for (const q of [{ city: "all", year: "all" as const }, { city: "London", year: "all" as const }, { city: "Leeds", year: 2019 }]) {
      const months = monthlyCounts(realSightings, q);
      expect(months).toHaveLength(12);
      expect(months.reduce((n, m) => n + m.count, 0)).toBe(selectSightings(realSightings, q).length);
    }
  });

  it("reproduces known totals from the raw data", () => {
    expect(monthlyCounts(realSightings, { city: "all", year: "all" })[11]?.count).toBe(100); // December
    expect(selectSightings(realSightings, { city: "London", year: "all" })).toHaveLength(76);
  });

  it("returns all zeros (not invented data) for a city/year with no records", () => {
    const q = { city: "Atlantis", year: 2019 };
    expect(monthlyCounts(realSightings, q).every((m) => m.count === 0)).toBe(true);
    expect(peakMonth(monthlyCounts(realSightings, q))).toBeNull();
  });

  it("lists cities and years from the data, newest year first", () => {
    expect(availableCities(realSightings)).toHaveLength(14);
    const years = availableYears(realSightings);
    expect(years[0]).toBe(2024);
    expect(years.at(-1)).toBe(2012);
  });

  it("yearly series is contiguous and fills quiet years with 0", () => {
    const series = yearlyCounts(realSightings, "all");
    expect(series).toHaveLength(13);
    expect(series.reduce((n, y) => n + y.count, 0)).toBe(1000);
    const sparse = yearlyCounts(realSightings.filter((s) => s.city === "Leeds" && (s.year === 2012 || s.year === 2024)), "Leeds");
    expect(sparse).toHaveLength(13);
    expect(sparse.some((y) => y.count === 0)).toBe(true);
    expect(yearlyCounts([], "x")).toEqual([]);
  });

  it("species breakdown is sorted and complete", () => {
    const b = speciesBreakdown(realSightings);
    expect(b).toHaveLength(5);
    expect(b[0]).toEqual({ species: "Passerine tick", count: 226 });
  });
});
