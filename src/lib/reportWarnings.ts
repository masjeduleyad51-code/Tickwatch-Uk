import { getCityInfo } from "@/data/ukCities";
import { localWallClock, toTimestamp } from "@/schemas/reportSchema";

export interface WarningInput {
  date: string;
  time: string;
  city: string;
  species: string;
  description: string;
  lat: number | null;
  lng: number | null;
  hasPhoto: boolean;
}

export interface FormWarning {
  field: "date" | "time" | "city" | "species" | "description" | "photo";
  message: string;
}

const DAY = 86_400_000;

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const h =
    Math.sin(rad(b.lat - a.lat) / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** Non-blocking advice. Errors (blocking) live in the Zod schema. */
export function computeWarnings(v: WarningInput, now: Date = new Date()): FormWarning[] {
  const out: FormWarning[] = [];
  const t = toTimestamp(v.date, v.time || "12:00");
  if (!Number.isNaN(t) && localWallClock(now) - t > 365 * DAY) {
    out.push({ field: "date", message: "This was over a year ago. Older reports are kept, but recent ones are more useful." });
  }
  const hour = Number(v.time.split(":")[0]);
  if (/^\d{2}:\d{2}$/.test(v.time) && hour < 6) {
    out.push({ field: "time", message: "That’s an unusual time to spot a tick. Check it’s 24-hour time (14:30, not 02:30)." });
  }
  if (v.species === "unknown") {
    out.push({ field: "species", message: "Without a species, a photo helps others identify it." });
  }
  if (v.lat !== null && v.lng !== null) {
    const city = getCityInfo(v.city);
    if (city && distanceKm(city.coordinates, { lat: v.lat, lng: v.lng }) > 60) {
      out.push({ field: "city", message: `Your pin is over 60 km from ${v.city}. Choose a nearer city if that’s wrong.` });
    }
  }
  if (!v.hasPhoto) out.push({ field: "photo", message: "No photo added. That’s fine, but a photo makes the report more useful." });
  if (v.description.trim() === "") out.push({ field: "description", message: "A short note about where you found it (pet, garden, walk) helps." });
  return out;
}
