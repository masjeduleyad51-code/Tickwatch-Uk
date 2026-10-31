export type RouteName = "explore" | "report" | "learn";

export interface Route {
  name: RouteName;
  params: URLSearchParams;
}

const NAMES: readonly RouteName[] = ["explore", "report", "learn"];

/** "#/report?city=London" -> { name: "report", params: {city: "London"} }. Unknown paths fall back to explore. */
export function parseHash(hash: string): Route {
  const raw = hash.replace(/^#\/?/, "");
  const [path = "", query = ""] = raw.split("?");
  const name = NAMES.find((n) => n === path) ?? "explore";
  return { name, params: new URLSearchParams(query) };
}

export function buildHash(name: RouteName, params?: Record<string, string | undefined>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params ?? {})) if (v) q.set(k, v);
  const s = q.toString();
  return `#/${name}${s ? `?${s}` : ""}`;
}
