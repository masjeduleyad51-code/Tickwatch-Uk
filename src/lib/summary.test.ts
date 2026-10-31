import { describe, expect, it } from "vitest";
import { mapSightings } from "@/services/mappers";
import { makeDtos } from "@/test/factories";
import { summarise } from "./summary";

describe("summarise", () => {
  it("counts totals, cities, species and the date range", () => {
    const { sightings } = mapSightings(makeDtos(8));
    const s = summarise(sightings);
    expect(s.total).toBe(8);
    expect(s.cityCount).toBe(4);
    expect(s.speciesCount).toBe(1);
    expect(s.firstTimestamp).toBe(Date.UTC(2023, 2, 1, 12));
    expect(s.lastTimestamp).toBe(Date.UTC(2023, 2, 8, 12));
  });

  it("handles an empty list", () => {
    expect(summarise([])).toEqual({ total: 0, cityCount: 0, speciesCount: 0, firstTimestamp: null, lastTimestamp: null });
  });
});
