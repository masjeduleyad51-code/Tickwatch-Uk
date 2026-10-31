import { z } from "zod";
import { UK_CITIES } from "@/data/ukCities";
import { SPECIES_NAMES } from "@/data/species";

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_DESCRIPTION = 500;

const CITY_NAMES = UK_CITIES.map((c) => c.name) as [string, ...string[]];
const SPECIES = SPECIES_NAMES as [string, ...string[]];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** "2024-08-01" + "14:30" -> ms since epoch (UTC wall clock, like the API). NaN if impossible. */
export function toTimestamp(date: string, time: string): number {
  if (!DATE_RE.test(date) || !TIME_RE.test(time)) return NaN;
  const [y = 0, m = 0, d = 0] = date.split("-").map(Number);
  const [hh = 0, mm = 0] = time.split(":").map(Number);
  const t = Date.UTC(y, m - 1, d, hh, mm);
  const c = new Date(t);
  return c.getUTCFullYear() === y && c.getUTCMonth() === m - 1 && c.getUTCDate() === d ? t : NaN;
}

/** The user's local "now" as a wall-clock timestamp comparable with toTimestamp(). */
export function localWallClock(now: Date): number {
  return Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());
}

export function makeReportSchema(now: Date = new Date()) {
  return z
    .object({
      date: z
        .string()
        .min(1, "Enter the date you saw the tick.")
        .refine((v) => v === "" || !Number.isNaN(toTimestamp(v, "00:00")), "Enter a real date."),
      time: z
        .string()
        .min(1, "Enter the approximate time.")
        .regex(TIME_RE, "Enter a time such as 14:30."),
      city: z
        .string()
        .min(1, "Choose the nearest city.")
        .refine((v) => v === "" || (CITY_NAMES as string[]).includes(v), "Choose a city from the list."),
      species: z
        .string()
        .min(1, "Choose a species, or “Not sure”.")
        .refine((v) => v === "" || v === "unknown" || (SPECIES as string[]).includes(v), "Choose a species from the list."),
      description: z.string().max(MAX_DESCRIPTION, `Keep this under ${MAX_DESCRIPTION} characters.`),
      lat: z.number().nullable(),
      lng: z.number().nullable(),
    })
    .superRefine((v, ctx) => {
      const t = toTimestamp(v.date, v.time);
      if (!Number.isNaN(t) && t > localWallClock(now)) {
        ctx.addIssue({ code: "custom", path: ["date"], message: "The sighting can’t be in the future." });
      }
      if (v.date && !Number.isNaN(toTimestamp(v.date, "00:00")) && v.date < "2000-01-01") {
        ctx.addIssue({ code: "custom", path: ["date"], message: "Dates before 2000 aren’t accepted." });
      }
    });
}

export type ReportFormValues = z.infer<ReturnType<typeof makeReportSchema>>;

export function validatePhoto(file: File | null): string | null {
  if (!file) return null;
  if (!(PHOTO_TYPES as readonly string[]).includes(file.type)) return "Upload a JPEG, PNG or WebP image.";
  if (file.size > MAX_PHOTO_BYTES) return `That image is ${(file.size / 1048576).toFixed(1)} MB. The limit is 5 MB.`;
  if (file.size === 0) return "That file is empty.";
  return null;
}
