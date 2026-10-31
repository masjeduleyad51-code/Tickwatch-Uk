import { describe, expect, it } from "vitest";

// Smoke test: every library the project depends on resolves and loads under jsdom.
const loaders: Record<string, () => Promise<unknown>> = {
  zod: () => import("zod"),
  "react-hook-form": () => import("react-hook-form"),
  "@hookform/resolvers/zod": () => import("@hookform/resolvers/zod"),
  recharts: () => import("recharts"),
  leaflet: () => import("leaflet"),
  "react-leaflet": () => import("react-leaflet"),
  "lucide-react": () => import("lucide-react"),
  "class-variance-authority": () => import("class-variance-authority"),
  clsx: () => import("clsx"),
  "tailwind-merge": () => import("tailwind-merge"),
  "@radix-ui/react-slot": () => import("@radix-ui/react-slot"),
};

describe("dependencies", () => {
  it.each(Object.keys(loaders))("loads %s", async (name) => {
    const load = loaders[name];
    expect(load).toBeDefined();
    await expect(load?.()).resolves.toBeDefined();
  });
});
