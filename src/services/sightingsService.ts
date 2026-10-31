import type { MappedSightings } from "@/types/sighting";
import { sightingsApi } from "./api/sightingsApi";
import { mapSightings } from "./mappers";

/**
 * The API is rate limited (HTTP 429) and has no filter/pagination parameters,
 * so we fetch the full list once, cache the in-flight promise for the session,
 * and do all filtering/grouping client-side. A failed request clears the cache
 * so "Try again" really retries.
 */
let cached: Promise<MappedSightings> | null = null;

export function loadSightings({ force = false }: { force?: boolean } = {}): Promise<MappedSightings> {
  if (force) cached = null;
  if (!cached) {
    const request = sightingsApi.getAll().then(({ records, skipped }) => {
      const mapped = mapSightings(records);
      return { ...mapped, skippedRecords: mapped.skippedRecords + skipped };
    });
    cached = request;
    request.catch(() => {
      if (cached === request) cached = null;
    });
  }
  return cached;
}

/** Test helper. */
export function resetSightingsCache(): void {
  cached = null;
}
