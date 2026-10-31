import type { NewReport, ReportRepository, StoredReport } from "@/types/report";

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  bucket?: string;
}

interface DbRow {
  id: string;
  created_at: string;
  occurred_at: string;
  city: string;
  species: string;
  latin_name: string;
  lat: number;
  lng: number;
  approximate_location: boolean;
  description: string;
  photo_path: string | null;
  photo_name: string | null;
  photo_type: string | null;
  photo_size: number | null;
}

/**
 * Optional production persistence via Supabase's REST APIs (PostgREST + Storage), using only the
 * PUBLIC anon key. Row Level Security (supabase/migrations) allows insert + select only.
 * Written against Supabase's documented REST API and covered by mocked-fetch tests;
 * it has NOT been run against a live project in this repo. See README.
 */
export function createSupabaseRepository(cfg: SupabaseConfig, fetchImpl: typeof fetch = fetch): ReportRepository {
  const base = cfg.url.replace(/\/+$/, "");
  const bucket = cfg.bucket ?? "report-photos";
  const headers = { apikey: cfg.anonKey, Authorization: `Bearer ${cfg.anonKey}` };

  const toStored = (r: DbRow): StoredReport => ({
    id: r.id,
    createdAt: r.created_at,
    occurredAt: r.occurred_at,
    city: r.city,
    species: r.species,
    latinName: r.latin_name,
    lat: r.lat,
    lng: r.lng,
    approximateLocation: r.approximate_location,
    description: r.description,
    photo: r.photo_path
      ? {
          name: r.photo_name ?? "photo",
          type: r.photo_type ?? "image/jpeg",
          size: r.photo_size ?? 0,
          url: `${base}/storage/v1/object/public/${bucket}/${r.photo_path}`,
        }
      : null,
  });

  async function ensureOk(res: Response, what: string): Promise<void> {
    if (!res.ok) throw new Error(`${what} failed (HTTP ${res.status}).`);
  }

  return {
    kind: "supabase",
    async list() {
      const res = await fetchImpl(`${base}/rest/v1/sighting_reports?select=*&order=created_at.desc&limit=500`, { headers });
      await ensureOk(res, "Loading reports");
      return ((await res.json()) as DbRow[]).map(toStored);
    },
    async add(report: NewReport) {
      let photoPath: string | null = null;
      if (report.photo) {
        const ext = report.photo.type.split("/")[1] ?? "jpg";
        photoPath = `${report.id}.${ext}`;
        const up = await fetchImpl(`${base}/storage/v1/object/${bucket}/${photoPath}`, {
          method: "POST",
          headers: { ...headers, "Content-Type": report.photo.type, "x-upsert": "true" },
          body: report.photo,
        });
        await ensureOk(up, "Uploading the photo");
      }
      const body = {
        id: report.id,
        occurred_at: report.occurredAt,
        city: report.city,
        species: report.species,
        latin_name: report.latinName,
        lat: report.lat,
        lng: report.lng,
        approximate_location: report.approximateLocation,
        description: report.description,
        photo_path: photoPath,
        photo_name: report.photo?.name ?? null,
        photo_type: report.photo?.type ?? null,
        photo_size: report.photo?.size ?? null,
      };
      const res = await fetchImpl(`${base}/rest/v1/sighting_reports`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json", Prefer: "return=representation,resolution=ignore-duplicates" },
        body: JSON.stringify(body),
      });
      await ensureOk(res, "Saving the report");
      const rows = (await res.json()) as DbRow[];
      const row = rows[0];
      if (!row) throw new Error("The database did not confirm the report was saved.");
      return toStored(row);
    },
  };
}
