export interface AppEnv {
  /** API base URL without a trailing slash, e.g. https://dev-task.elancoapps.com/data */
  apiBaseUrl: string;
  requestTimeoutMs: number;
  /** Optional public Supabase settings. When both are set, reports are saved to Supabase. */
  supabaseUrl: string | undefined;
  supabaseAnonKey: string | undefined;
}

export const DEFAULT_API_BASE_URL = "https://dev-task.elancoapps.com/data";

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;
}

function normaliseBaseUrl(value: string): string {
  if (!/^(https?:\/\/|\/)/.test(value)) {
    throw new Error(
      `VITE_API_BASE_URL must start with http://, https:// or "/" (got "${value}").`,
    );
  }
  return value.replace(/\/+$/, "");
}

function positiveInt(raw: unknown, fallback: number, name: string): number {
  const value = str(raw);
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer (got "${value}").`);
  }
  return parsed;
}

/** Pure so it can be tested without Vite. */
export function readEnv(raw: Readonly<Record<string, unknown>> = {}): AppEnv {
  return {
    apiBaseUrl: normaliseBaseUrl(str(raw.VITE_API_BASE_URL) ?? DEFAULT_API_BASE_URL),
    requestTimeoutMs: positiveInt(raw.VITE_API_TIMEOUT_MS, 15_000, "VITE_API_TIMEOUT_MS"),
    supabaseUrl: str(raw.VITE_SUPABASE_URL),
    supabaseAnonKey: str(raw.VITE_SUPABASE_ANON_KEY),
  };
}

export const env: AppEnv = readEnv(import.meta.env);
