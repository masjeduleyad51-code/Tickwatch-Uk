import { describe, expect, it } from "vitest";
import { makeDto } from "@/test/factories";
import { parseSighting, parseSightingList, parseStats } from "./schemas";

describe("parseSightingList", () => {
  it("accepts documented records", () => {
    const { records, skipped } = parseSightingList([makeDto(), makeDto({ id: "b" })]);
    expect(records).toHaveLength(2);
    expect(skipped).toBe(0);
  });

  it("drops invalid rows but keeps valid ones", () => {
    const { records, skipped } = parseSightingList([
      makeDto(),
      { id: "missing-fields" },
      makeDto({ date: "14/08/2025" }),
      makeDto({ date: "2025-08-14T17:30:00+01:00" }),
    ]);
    expect(records).toHaveLength(1);
    expect(skipped).toBe(3);
  });

  it("throws when the payload is not an array", () => {
    expect(() => parseSightingList({ error: "Internal server error" })).toThrow(/array/);
  });

  it("throws when every row is invalid", () => {
    expect(() => parseSightingList([{ nope: true }])).toThrow(/expected shape/);
  });

  it("accepts an empty list", () => {
    expect(parseSightingList([])).toEqual({ records: [], skipped: 0 });
  });
});

describe("parseSighting / parseStats", () => {
  it("parses a single sighting and rejects a bad one", () => {
    expect(parseSighting(makeDto()).location).toBe("Manchester");
    expect(() => parseSighting({})).toThrow();
  });

  it("parses the documented stats shape", () => {
    expect(parseStats({ total_sightings: 1000, api_version: "1.0.0" })).toEqual({
      total_sightings: 1000,
      api_version: "1.0.0",
    });
    expect(() => parseStats({ total_sightings: "1000" })).toThrow();
  });
});
