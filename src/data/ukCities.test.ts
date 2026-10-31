import { describe, expect, it } from "vitest";
import fullSample from "@/test/fixtures/sightings.full.json";
import { UK_BOUNDS, UK_CITIES, getCityInfo } from "./ukCities";

describe("UK city coordinates", () => {
  it("covers every city present in the real API sample", () => {
    const cities = [...new Set(fullSample.map((r) => r.location))];
    expect(cities).toHaveLength(14);
    for (const city of cities) expect(getCityInfo(city), city).toBeDefined();
  });

  it("keeps every point inside the UK bounding box", () => {
    for (const { name, coordinates } of UK_CITIES) {
      expect(coordinates.lat, name).toBeGreaterThan(UK_BOUNDS.south);
      expect(coordinates.lat, name).toBeLessThan(UK_BOUNDS.north);
      expect(coordinates.lng, name).toBeGreaterThan(UK_BOUNDS.west);
      expect(coordinates.lng, name).toBeLessThan(UK_BOUNDS.east);
    }
  });

  it("matches case-sensitively, like the API", () => {
    expect(getCityInfo("London")).toBeDefined();
    expect(getCityInfo("london")).toBeUndefined();
  });
});
