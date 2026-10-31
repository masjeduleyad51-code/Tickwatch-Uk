import { buildHash, parseHash } from "./route";

describe("hash routing", () => {
  it("parses names and params, falling back to explore", () => {
    expect(parseHash("#/report?city=London")).toMatchObject({ name: "report" });
    expect(parseHash("#/report?city=London").params.get("city")).toBe("London");
    expect(parseHash("#/learn?tab=seasonal").params.get("tab")).toBe("seasonal");
    expect(parseHash("").name).toBe("explore");
    expect(parseHash("#/nope").name).toBe("explore");
  });
  it("round-trips and encodes", () => {
    expect(buildHash("explore", { city: "Newcastle" })).toBe("#/explore?city=Newcastle");
    expect(buildHash("report", { city: undefined })).toBe("#/report");
    expect(parseHash(buildHash("explore", { city: "A&B" })).params.get("city")).toBe("A&B");
  });
});
