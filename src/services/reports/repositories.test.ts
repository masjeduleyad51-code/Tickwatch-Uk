import "fake-indexeddb/auto";
import { createIndexedDbRepository } from "./indexedDbRepository";
import { createSupabaseRepository } from "./supabaseRepository";
import type { NewReport } from "@/types/report";

const report = (o: Partial<NewReport> = {}): NewReport => ({
  id: "11111111-1111-4111-8111-111111111111",
  occurredAt: "2026-10-30T14:30:00",
  city: "London",
  species: "Marsh tick",
  latinName: "Ixodes apronophorus",
  lat: 51.5074,
  lng: -0.1278,
  approximateLocation: true,
  description: "On the dog",
  photo: null,
  ...o,
});

beforeAll(() => {
  // jsdom has no object URLs
  URL.createObjectURL = () => "blob:test";
});

describe("IndexedDB repository (local prototype database)", () => {
  it("persists across repository instances (i.e. survives a page refresh) and keeps the photo", async () => {
    const photo = new File([new Uint8Array([1, 2, 3])], "tick.png", { type: "image/png" });
    const saved = await createIndexedDbRepository().add(report({ photo }));
    expect(saved.photo).toMatchObject({ name: "tick.png", size: 3 });

    const reloaded = await createIndexedDbRepository().list(); // fresh instance = fresh page load
    expect(reloaded.map((r) => r.id)).toContain(saved.id);
    expect(reloaded.find((r) => r.id === saved.id)?.photo?.type).toBe("image/png");
  });

  it("re-submitting the same id does not create a duplicate", async () => {
    const repo = createIndexedDbRepository();
    await repo.add(report({ id: "dup-1" }));
    await repo.add(report({ id: "dup-1", description: "again" }));
    expect((await repo.list()).filter((r) => r.id === "dup-1")).toHaveLength(1);
  });
});

describe("Supabase repository (mocked fetch; not run against a live project)", () => {
  const cfg = { url: "https://abc.supabase.co/", anonKey: "anon-key" };
  const row = {
    id: "r1", created_at: "2026-10-31T10:00:00Z", occurred_at: "2026-10-30T14:30:00", city: "London", species: "Marsh tick",
    latin_name: "Ixodes apronophorus", lat: 51.5, lng: -0.1, approximate_location: true, description: "", photo_path: null,
    photo_name: null, photo_type: null, photo_size: null,
  };
  const json = (body: unknown, status = 200) => Promise.resolve(new Response(JSON.stringify(body), { status }));

  it("inserts with the public anon key only, and returns what the database confirmed", async () => {
    const fetchMock = vi.fn(() => json([row], 201));
    const saved = await createSupabaseRepository(cfg, fetchMock as unknown as typeof fetch).add(report());
    expect(saved.id).toBe("r1");
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://abc.supabase.co/rest/v1/sighting_reports");
    expect((init.headers as Record<string, string>).apikey).toBe("anon-key");
    expect(JSON.stringify(init)).not.toMatch(/service_role/);
  });

  it("uploads the photo first, then stores its path", async () => {
    const fetchMock = vi.fn((url: string) => (url.includes("/storage/") ? json({}) : json([{ ...row, photo_path: "p.png" }], 201)));
    const photo = new File([new Uint8Array(4)], "p.png", { type: "image/png" });
    const saved = await createSupabaseRepository(cfg, fetchMock as unknown as typeof fetch).add(report({ photo }));
    expect(fetchMock.mock.calls[0]?.[0]).toContain("/storage/v1/object/report-photos/");
    expect(saved.photo?.url).toContain("/storage/v1/object/public/report-photos/p.png");
  });

  it("rejects (never pretends success) on HTTP errors or an empty confirmation", async () => {
    const repoFor = (f: () => Promise<Response>) => createSupabaseRepository(cfg, f as unknown as typeof fetch);
    await expect(repoFor(() => json({ message: "denied" }, 401)).add(report())).rejects.toThrow(/401/);
    await expect(repoFor(() => json([], 201)).add(report())).rejects.toThrow(/did not confirm/);
    await expect(repoFor(() => Promise.reject(new TypeError("Failed to fetch"))).add(report())).rejects.toThrow();
  });
});
