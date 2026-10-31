import type { Sighting } from "@/types/sighting";

export interface SightingsSummary {
  total: number;
  cityCount: number;
  speciesCount: number;
  firstTimestamp: number | null;
  lastTimestamp: number | null;
}

export function summarise(sightings: readonly Sighting[]): SightingsSummary {
  const cities = new Set<string>();
  const species = new Set<string>();
  let first: number | null = null;
  let last: number | null = null;
  for (const s of sightings) {
    cities.add(s.city);
    species.add(s.species);
    if (first === null || s.timestamp < first) first = s.timestamp;
    if (last === null || s.timestamp > last) last = s.timestamp;
  }
  return {
    total: sightings.length,
    cityCount: cities.size,
    speciesCount: species.size,
    firstTimestamp: first,
    lastTimestamp: last,
  };
}
