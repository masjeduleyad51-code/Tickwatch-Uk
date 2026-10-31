/** App-level (domain) types. UI code depends on these, never on raw DTOs. */

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Sighting {
  id: string;
  /** Original API string, safe to put in <time dateTime>. */
  occurredAt: string;
  /** Milliseconds since epoch. The API date has no timezone, so it is read as UTC wall-clock time. */
  timestamp: number;
  year: number;
  /** 1-12 */
  month: number;
  city: string;
  /** null when the city is not in our coordinates table (the API provides no coordinates). */
  coordinates: Coordinates | null;
  species: string;
  latinName: string;
}

export interface MappedSightings {
  /** Newest first. */
  sightings: Sighting[];
  /** Records dropped because they failed validation or had an impossible date. */
  skippedRecords: number;
  /** Cities seen in the data that have no entry in the coordinates table. */
  unmappedCities: string[];
}
