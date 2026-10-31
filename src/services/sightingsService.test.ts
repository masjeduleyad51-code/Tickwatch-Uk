import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeDto } from "@/test/factories";
import { sightingsApi } from "./api/sightingsApi";
import { loadSightings, resetSightingsCache } from "./sightingsService";

vi.mock("./api/sightingsApi", () => ({ sightingsApi: { getAll: vi.fn() } }));
const getAll = vi.mocked(sightingsApi.getAll);

beforeEach(() => {
  resetSightingsCache();
  getAll.mockReset();
});

describe("loadSightings", () => {
  it("makes one request for repeated calls (the API is rate limited) and adds schema-skipped rows", async () => {
    getAll.mockResolvedValue({ records: [makeDto()], skipped: 2 });
    const [a, b] = await Promise.all([loadSightings(), loadSightings()]);
    await loadSightings();
    expect(getAll).toHaveBeenCalledTimes(1);
    expect(a).toBe(b);
    expect(a.skippedRecords).toBe(2);
  });

  it("refetches when forced", async () => {
    getAll.mockResolvedValue({ records: [makeDto()], skipped: 0 });
    await loadSightings();
    await loadSightings({ force: true });
    expect(getAll).toHaveBeenCalledTimes(2);
  });

  it("does not cache failures", async () => {
    getAll.mockRejectedValueOnce(new Error("boom"));
    await expect(loadSightings()).rejects.toThrow("boom");
    getAll.mockResolvedValue({ records: [makeDto()], skipped: 0 });
    await expect(loadSightings()).resolves.toBeDefined();
    expect(getAll).toHaveBeenCalledTimes(2);
  });
});
