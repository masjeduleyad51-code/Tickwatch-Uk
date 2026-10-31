import { describe, expect, it } from "vitest";
import { getJson } from "./client";
import { ApiError, toApiError } from "./errors";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
const identity = (data: unknown) => data;
const base = { baseUrl: "https://api.test/data/", timeoutMs: 500 };
const hang: typeof fetch = (_url, init) =>
  new Promise((_resolve, reject) => {
    init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
  });

describe("getJson", () => {
  it("builds the URL, sends Accept: application/json and returns the parsed body", async () => {
    let url = "";
    let accept: string | null = null;
    const result = await getJson("/stats", identity, {
      ...base,
      fetchImpl: async (input, init) => {
        url = String(input);
        accept = new Headers(init?.headers).get("accept");
        return json({ total_sightings: 1000, api_version: "1.0.0" });
      },
    });
    expect(result).toEqual({ total_sightings: 1000, api_version: "1.0.0" });
    expect(url).toBe("https://api.test/data/stats");
    expect(accept).toBe("application/json");
  });

  it("maps 429 to rate_limit and keeps the API's message", async () => {
    const promise = getJson("/x", identity, {
      ...base,
      fetchImpl: async () => json({ error: "Rate limit exceeded, please try again later" }, 429),
    });
    await expect(promise).rejects.toMatchObject({
      kind: "rate_limit",
      status: 429,
      message: "Rate limit exceeded, please try again later",
    });
  });

  it("still classifies a 429 with a non-JSON body", async () => {
    const promise = getJson("/x", identity, {
      ...base,
      fetchImpl: async () => new Response("<html>slow down</html>", { status: 429 }),
    });
    await expect(promise).rejects.toMatchObject({ kind: "rate_limit", message: "Rate limit exceeded." });
  });

  it.each([
    [404, "not_found"],
    [500, "server"],
    [400, "client"],
  ] as const)("maps HTTP %i to %s", async (status, kind) => {
    const promise = getJson("/x", identity, { ...base, fetchImpl: async () => json({ error: "x" }, status) });
    await expect(promise).rejects.toMatchObject({ kind, status });
  });

  it("maps a failed fetch to network", async () => {
    const promise = getJson("/x", identity, {
      ...base,
      fetchImpl: async () => {
        throw new TypeError("Failed to fetch");
      },
    });
    await expect(promise).rejects.toMatchObject({ kind: "network" });
  });

  it("maps non-JSON 200 and parser failures to invalid_response", async () => {
    await expect(
      getJson("/x", identity, { ...base, fetchImpl: async () => new Response("not json") }),
    ).rejects.toMatchObject({ kind: "invalid_response" });
    await expect(
      getJson(
        "/x",
        () => {
          throw new Error("bad shape");
        },
        { ...base, fetchImpl: async () => json([]) },
      ),
    ).rejects.toMatchObject({ kind: "invalid_response" });
  });

  it("times out a hung request", async () => {
    const promise = getJson("/x", identity, { baseUrl: base.baseUrl, timeoutMs: 20, fetchImpl: hang });
    await expect(promise).rejects.toMatchObject({ kind: "timeout" });
  });

  it("rethrows the original AbortError when the caller cancels", async () => {
    const controller = new AbortController();
    const promise = getJson("/x", identity, { ...base, signal: controller.signal, fetchImpl: hang });
    controller.abort();
    const error: unknown = await promise.catch((e: unknown) => e);
    expect(error).not.toBeInstanceOf(ApiError);
    expect((error as Error).name).toBe("AbortError");
  });
});

describe("toApiError", () => {
  it("wraps unknown values and passes ApiErrors through", () => {
    expect(toApiError(new Error("boom")).kind).toBe("unknown");
    const original = new ApiError("server", "x");
    expect(toApiError(original)).toBe(original);
  });
});
