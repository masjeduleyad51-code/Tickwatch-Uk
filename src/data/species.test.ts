import { realSightings } from "@/test/realData";
import { SPECIES_GUIDE, getSpecies } from "./species";

describe("species guide", () => {
  it("covers every species and Latin name the real API returns, and nothing else", () => {
    const fromApi = new Map(realSightings.map((s) => [s.species, s.latinName] as const));
    expect(SPECIES_GUIDE).toHaveLength(fromApi.size);
    for (const [name, latin] of fromApi) expect(getSpecies(name)?.latinName).toBe(latin);
  });
});
