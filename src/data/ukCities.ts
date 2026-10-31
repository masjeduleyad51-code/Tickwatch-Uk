import type { Coordinates } from "@/types/sighting";

/**
 * The API returns only a city NAME per sighting - no coordinates. This table is
 * OUR data (approximate city-centre points) for the 14 cities present in the
 * dataset. It is not from the API. Add a row here if the API starts returning a new city.
 */
export interface CityInfo {
  name: string;
  region: "England" | "Scotland" | "Wales";
  coordinates: Coordinates;
}

export const UK_CITIES: readonly CityInfo[] = [
  { name: "London", region: "England", coordinates: { lat: 51.5074, lng: -0.1278 } },
  { name: "Birmingham", region: "England", coordinates: { lat: 52.4862, lng: -1.8904 } },
  { name: "Manchester", region: "England", coordinates: { lat: 53.4808, lng: -2.2426 } },
  { name: "Liverpool", region: "England", coordinates: { lat: 53.4084, lng: -2.9916 } },
  { name: "Bristol", region: "England", coordinates: { lat: 51.4545, lng: -2.5879 } },
  { name: "Sheffield", region: "England", coordinates: { lat: 53.3811, lng: -1.4701 } },
  { name: "Leeds", region: "England", coordinates: { lat: 53.8008, lng: -1.5491 } },
  { name: "Leicester", region: "England", coordinates: { lat: 52.6369, lng: -1.1398 } },
  { name: "Nottingham", region: "England", coordinates: { lat: 52.9548, lng: -1.1581 } },
  { name: "Newcastle", region: "England", coordinates: { lat: 54.9783, lng: -1.6178 } },
  { name: "Southampton", region: "England", coordinates: { lat: 50.9097, lng: -1.4044 } },
  { name: "Glasgow", region: "Scotland", coordinates: { lat: 55.8642, lng: -4.2518 } },
  { name: "Edinburgh", region: "Scotland", coordinates: { lat: 55.9533, lng: -3.1883 } },
  { name: "Cardiff", region: "Wales", coordinates: { lat: 51.4816, lng: -3.1791 } },
];

const byName = new Map(UK_CITIES.map((city) => [city.name, city] as const));

/** Exact, case-sensitive - mirrors how the API matches `location`. */
export function getCityInfo(name: string): CityInfo | undefined {
  return byName.get(name);
}

/** Rough bounding box of the UK, used for sanity checks and (later) map bounds. */
export const UK_BOUNDS = { south: 49.8, west: -8.7, north: 60.9, east: 1.8 } as const;
export const UK_MAP_CENTER: Coordinates = { lat: 54.5, lng: -3.5 };
