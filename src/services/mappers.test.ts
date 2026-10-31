import { describe, expect, it } from "vitest";
import { makeDto, makeDtos } from "@/test/factories";
import { mapSighting, mapSightings, parseNaiveDateTime } from "./mappers";

describe("parseNaiveDateTime", () => {
  it("reads the API format as UTC wall-clock time", () => {
    expect(parseNaiveDateTime("2022-08-01T06:40:31")).toEqual({
      timestamp: Date.UTC(2022, 7, 1, 6, 40, 31),
      year: 2022,
      month: 8,
    });
  });

  it("accepts a leap day and rejects impossible dates", () => {
    expect(parseNaiveDateTime("2024-02-29T23:59:59")).not.toBeNull();
    for (const bad of ["2023-02-29T10:00:00", "2024-13-01T10:00:00", "2024-04-31T10:00:00", "2024-01-01T24:00:00", "garbage", ""]) {
      expect(parseNaiveDateTime(bad)).toBeNull();
    }
  });
});

describe("mapSighting", () => {
  it("maps fields and attaches coordinates for known cities", () => {
    const s = mapSighting(makeDto({ location: "Cardiff" }));
    expect(s).toMatchObject({ city: "Cardiff", species: "Marsh tick", year: 2022, month: 8 });
    expect(s?.coordinates).toEqual({ lat: 51.4816, lng: -3.1791 });
  });
});

describe("mapSightings", () => {
  it("sorts newest first", () => {
    const { sightings } = mapSightings(makeDtos(10));
    const times = sightings.map((s) => s.timestamp);
    expect(times).toEqual([...times].sort((a, b) => b - a));
  });

  it("keeps unknown cities (coordinates null), reports them, and skips bad dates", () => {
    const result = mapSightings([
      makeDto({ id: "a", location: "Atlantis" }),
      makeDto({ id: "b", date: "2024-99-01T00:00:00" }),
    ]);
    expect(result.sightings).toHaveLength(1);
    expect(result.sightings[0]?.coordinates).toBeNull();
    expect(result.unmappedCities).toEqual(["Atlantis"]);
    expect(result.skippedRecords).toBe(1);
  });
});
