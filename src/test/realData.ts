import { mapSightings } from "@/services/mappers";
import type { SightingDto } from "@/types/api";
import fixture from "./fixtures/sightings.full.json";

/** The saved real API response (1,000 records), mapped exactly as the app maps it. */
export const realSightings = mapSightings(fixture as SightingDto[]).sightings;
