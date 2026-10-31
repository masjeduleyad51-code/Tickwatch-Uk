import { getCityInfo } from "@/data/ukCities";
import type { SightingDto } from "@/types/api";
import type { MappedSightings, Sighting } from "@/types/sighting";

const DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/;

export interface ParsedDateTime {
  timestamp: number;
  year: number;
  month: number;
}

/**
 * The API gives "2022-08-01T06:40:31" with no timezone. We read it as UTC
 * wall-clock time so year/month grouping never shifts with the viewer's locale.
 * Returns null for impossible dates (e.g. month 13, 31 June).
 */
export function parseNaiveDateTime(value: string): ParsedDateTime | null {
  const match = DATE_TIME.exec(value);
  if (!match) return null;
  const [year = NaN, month = NaN, day = NaN, hour = NaN, minute = NaN, second = NaN] = match
    .slice(1, 7)
    .map(Number);
  const timestamp = Date.UTC(year, month - 1, day, hour, minute, second);
  const check = new Date(timestamp);
  const valid =
    check.getUTCFullYear() === year &&
    check.getUTCMonth() === month - 1 &&
    check.getUTCDate() === day &&
    hour <= 23 &&
    minute <= 59 &&
    second <= 59;
  return valid ? { timestamp, year, month } : null;
}

export function mapSighting(dto: SightingDto): Sighting | null {
  const parsed = parseNaiveDateTime(dto.date);
  if (!parsed) return null;
  return {
    id: dto.id,
    occurredAt: dto.date,
    timestamp: parsed.timestamp,
    year: parsed.year,
    month: parsed.month,
    city: dto.location,
    coordinates: getCityInfo(dto.location)?.coordinates ?? null,
    species: dto.species,
    latinName: dto.latinName,
  };
}

/** DTOs -> domain objects, newest first (ties broken by id for a stable order). */
export function mapSightings(dtos: readonly SightingDto[]): MappedSightings {
  const sightings: Sighting[] = [];
  const unmapped = new Set<string>();
  let skippedRecords = 0;

  for (const dto of dtos) {
    const sighting = mapSighting(dto);
    if (!sighting) {
      skippedRecords += 1;
      continue;
    }
    if (!sighting.coordinates) unmapped.add(sighting.city);
    sightings.push(sighting);
  }

  sightings.sort((a, b) => b.timestamp - a.timestamp || a.id.localeCompare(b.id));
  return { sightings, skippedRecords, unmappedCities: [...unmapped].sort() };
}
