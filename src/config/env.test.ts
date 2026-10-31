import { describe, expect, it } from "vitest";
import { readEnv } from "./env";

describe("readEnv", () => {
  it("uses documented defaults", () => {
    expect(readEnv({})).toEqual({
      apiBaseUrl: "https://dev-task.elancoapps.com/data",
      requestTimeoutMs: 15000,
      supabaseUrl: undefined,
      supabaseAnonKey: undefined,
    });
  });

  it("strips trailing slashes and accepts a relative proxy path", () => {
    expect(readEnv({ VITE_API_BASE_URL: "https://x.test/data//" }).apiBaseUrl).toBe("https://x.test/data");
    expect(readEnv({ VITE_API_BASE_URL: "/elanco" }).apiBaseUrl).toBe("/elanco");
  });

  it("reads optional public Supabase settings", () => {
    const e = readEnv({ VITE_SUPABASE_URL: " https://abc.supabase.co ", VITE_SUPABASE_ANON_KEY: "anon" });
    expect(e.supabaseUrl).toBe("https://abc.supabase.co");
    expect(e.supabaseAnonKey).toBe("anon");
  });

  it("rejects invalid values with a helpful message", () => {
    expect(() => readEnv({ VITE_API_BASE_URL: "dev-task.elancoapps.com" })).toThrow(/must start with/);
    expect(() => readEnv({ VITE_API_TIMEOUT_MS: "0" })).toThrow(/positive integer/);
    expect(() => readEnv({ VITE_API_TIMEOUT_MS: "abc" })).toThrow(/positive integer/);
  });
});
