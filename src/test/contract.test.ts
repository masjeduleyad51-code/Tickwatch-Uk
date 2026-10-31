import { describe, expect, it } from "vitest";
import { parseSightingList, parseStats } from "@/services/api/schemas";
import { mapSightings } from "@/services/mappers";
import fullSample from "./fixtures/sightings.full.json";
import stats from "./fixtures/stats.json";

describe("real API response (saved from GET /data/tick-sightings)", () => {
  const { records, skipped } = parseSightingList(fullSample);

  it("passes schema validation with nothing skipped", () => {
    expect(records).toHaveLength(1000);
    expect(skipped).toBe(0);
  });

  it("agrees with GET /data/stats", () => {
    expect(parseStats(stats).total_sightings).toBe(records.length);
  });

  it("maps with no unmapped cities and ids are unique", () => {
    const mapped = mapSightings(records);
    expect(mapped.sightings).toHaveLength(1000);
    expect(mapped.skippedRecords).toBe(0);
    expect(mapped.unmappedCities).toEqual([]);
    expect(new Set(mapped.sightings.map((s) => s.id)).size).toBe(1000);
  });

  it("spans 2012-2024, so 'recent' filters must anchor on the dataset's latest date, not today", () => {
    const { sightings } = mapSightings(records);
    expect(sightings[0]?.year).toBe(2024);
    expect(sightings.at(-1)?.year).toBe(2012);
  });
});
