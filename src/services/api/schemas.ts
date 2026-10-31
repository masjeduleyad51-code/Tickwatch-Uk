import { z } from "zod";
import type { SightingDto, StatsDto } from "@/types/api";

// "2022-08-01T06:40:31" (optionally with fractional seconds / trailing Z).
// Anything with a numeric offset is rejected on purpose so we notice if the API changes.
const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z?$/;

export const sightingDtoSchema = z.object({
  id: z.string().min(1),
  date: z.string().regex(ISO_DATE_TIME),
  location: z.string().trim().min(1),
  species: z.string().trim().min(1),
  latinName: z.string().trim().min(1),
});

export const statsDtoSchema = z.object({
  total_sightings: z.number().int().nonnegative(),
  api_version: z.string().min(1),
});

export interface ParsedSightingList {
  records: SightingDto[];
  /** Records that did not match the schema and were dropped. */
  skipped: number;
}

/**
 * Validates record-by-record so one bad row does not blank the whole app.
 * Throws if the payload is not an array, or if *every* row is invalid.
 */
export function parseSightingList(data: unknown): ParsedSightingList {
  if (!Array.isArray(data)) throw new Error("Expected an array of sightings.");
  const records: SightingDto[] = [];
  let skipped = 0;
  for (const item of data as unknown[]) {
    const result = sightingDtoSchema.safeParse(item);
    if (result.success) records.push(result.data);
    else skipped += 1;
  }
  if (data.length > 0 && records.length === 0) {
    throw new Error("No sighting matched the expected shape.");
  }
  return { records, skipped };
}

export function parseSighting(data: unknown): SightingDto {
  return sightingDtoSchema.parse(data);
}

export function parseStats(data: unknown): StatsDto {
  return statsDtoSchema.parse(data);
}
