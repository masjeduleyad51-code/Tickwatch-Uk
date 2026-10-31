/**
 * Raw shapes returned by the Elanco Tick Sightings API (base: <host>/data).
 * Verified against a real GET /data/tick-sightings response (1000 records)
 * and GET /data/stats. Do not add fields here that the API does not return.
 */
export interface SightingDto {
  /** 20-character opaque id, unique per record. */
  id: string;
  /** ISO-8601 local date-time WITHOUT a timezone, e.g. "2022-08-01T06:40:31". */
  date: string;
  /** City name, e.g. "Manchester". Exact, case-sensitive. */
  location: string;
  /** Common species name, e.g. "Marsh tick". */
  species: string;
  /** Latin name, e.g. "Ixodes apronophorus". */
  latinName: string;
}

export interface StatsDto {
  total_sightings: number;
  api_version: string;
}

/** Body of every non-2xx response documented by the API. */
export interface ApiErrorBody {
  error: string;
}
