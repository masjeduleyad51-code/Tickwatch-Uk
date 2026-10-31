import type { SightingDto, StatsDto } from "@/types/api";
import { getJson, type RequestOptions } from "./client";
import {
  parseSighting,
  parseSightingList,
  parseStats,
  type ParsedSightingList,
} from "./schemas";

/**
 * Thin, typed wrappers over the documented endpoints. Paths are relative to
 * VITE_API_BASE_URL (default https://dev-task.elancoapps.com/data).
 * The API has no pagination or query parameters.
 */
export const sightingsApi = {
  getAll(options?: RequestOptions): Promise<ParsedSightingList> {
    return getJson("/tick-sightings", parseSightingList, options);
  },

  getById(id: string, options?: RequestOptions): Promise<SightingDto> {
    return getJson(`/tick-sightings/${encodeURIComponent(id)}`, parseSighting, options);
  },

  /** `city` is an exact, case-sensitive match on `location`. */
  getByCity(city: string, options?: RequestOptions): Promise<ParsedSightingList> {
    return getJson(`/tick-sightings/city/${encodeURIComponent(city)}`, parseSightingList, options);
  },

  /** `species` is an exact, case-sensitive match. The API accepts "Fox/badger tick" raw or encoded. */
  getBySpecies(species: string, options?: RequestOptions): Promise<ParsedSightingList> {
    return getJson(
      `/tick-sightings/species/${encodeURIComponent(species)}`,
      parseSightingList,
      options,
    );
  },

  getStats(options?: RequestOptions): Promise<StatsDto> {
    return getJson("/stats", parseStats, options);
  },
};
