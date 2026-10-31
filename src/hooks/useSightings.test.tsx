import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/services/api/errors";
import { mapSightings } from "@/services/mappers";
import { loadSightings } from "@/services/sightingsService";
import { makeDtos } from "@/test/factories";
import { useSightings } from "./useSightings";

vi.mock("@/services/sightingsService", () => ({ loadSightings: vi.fn() }));
const load = vi.mocked(loadSightings);

beforeEach(() => load.mockReset());

describe("useSightings", () => {
  it("goes loading -> success", async () => {
    load.mockResolvedValue(mapSightings(makeDtos(3)));
    const { result } = renderHook(() => useSightings());
    expect(result.current.state.status).toBe("loading");
    await waitFor(() => expect(result.current.state.status).toBe("success"));
  });

  it("reports empty when the API returns no sightings", async () => {
    load.mockResolvedValue(mapSightings([]));
    const { result } = renderHook(() => useSightings());
    await waitFor(() => expect(result.current.state.status).toBe("empty"));
  });

  it("exposes a typed error, then recovers on refetch (forcing a fresh request)", async () => {
    load.mockRejectedValueOnce(new ApiError("rate_limit", "Rate limit exceeded", { status: 429 }));
    const { result } = renderHook(() => useSightings());

    await waitFor(() => expect(result.current.state.status).toBe("error"));
    const failed = result.current.state;
    expect(failed.status === "error" && failed.error.kind).toBe("rate_limit");

    load.mockResolvedValue(mapSightings(makeDtos(2)));
    act(() => result.current.refetch());
    await waitFor(() => expect(result.current.state.status).toBe("success"));
    expect(load).toHaveBeenLastCalledWith({ force: true });
  });
});
