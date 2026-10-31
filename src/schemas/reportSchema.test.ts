import { computeWarnings } from "@/lib/reportWarnings";
import { MAX_PHOTO_BYTES, makeReportSchema, toTimestamp, validatePhoto } from "./reportSchema";

const NOW = new Date(2026, 9, 31, 12, 0); // 31 Oct 2026, 12:00 local
const valid = { date: "2026-10-30", time: "14:30", city: "London", species: "Marsh tick", description: "", lat: null, lng: null };
const schema = makeReportSchema(NOW);
const fieldErrors = (v: object) => {
  const r = schema.safeParse(v);
  return r.success ? {} : Object.fromEntries(r.error.issues.map((i) => [i.path.join("."), i.message]));
};

describe("report schema (errors)", () => {
  it("accepts a valid report, including 'Not sure' for species", () => {
    expect(schema.safeParse(valid).success).toBe(true);
    expect(schema.safeParse({ ...valid, species: "unknown" }).success).toBe(true);
  });
  it("requires date, time, city and species", () => {
    const e = fieldErrors({ ...valid, date: "", time: "", city: "", species: "" });
    expect(Object.keys(e).sort()).toEqual(["city", "date", "species", "time"]);
  });
  it("rejects future date-times but allows earlier today", () => {
    expect(fieldErrors({ ...valid, date: "2026-10-31", time: "12:30" }).date).toMatch(/future/);
    expect(fieldErrors({ ...valid, date: "2026-10-31", time: "11:59" }).date).toBeUndefined();
    expect(fieldErrors({ ...valid, date: "2027-01-01" }).date).toMatch(/future/);
  });
  it("rejects impossible dates, pre-2000 dates, unknown cities/species and long notes", () => {
    expect(fieldErrors({ ...valid, date: "2026-02-30" }).date).toBeDefined();
    expect(fieldErrors({ ...valid, date: "1999-12-31" }).date).toMatch(/before 2000/);
    expect(fieldErrors({ ...valid, city: "Atlantis" }).city).toBeDefined();
    expect(fieldErrors({ ...valid, species: "Dragon tick" }).species).toBeDefined();
    expect(fieldErrors({ ...valid, description: "x".repeat(501) }).description).toMatch(/500/);
  });
  it("toTimestamp is strict", () => {
    expect(toTimestamp("2024-02-29", "10:00")).not.toBeNaN();
    expect(toTimestamp("2023-02-29", "10:00")).toBeNaN();
    expect(toTimestamp("2024-01-01", "24:00")).toBeNaN();
  });
});

describe("photo validation", () => {
  const file = (type: string, size: number) => new File([new Uint8Array(size)], "t.img", { type });
  it("accepts images within the limit and no photo at all", () => {
    expect(validatePhoto(null)).toBeNull();
    expect(validatePhoto(file("image/png", 1000))).toBeNull();
  });
  it("rejects wrong types, oversize and empty files with a helpful message", () => {
    expect(validatePhoto(file("application/pdf", 1000))).toMatch(/JPEG, PNG or WebP/);
    expect(validatePhoto(file("image/jpeg", MAX_PHOTO_BYTES + 1))).toMatch(/limit is 5 MB/);
    expect(validatePhoto(file("image/jpeg", 0))).toMatch(/empty/);
  });
});

describe("report warnings (non-blocking)", () => {
  const base = { ...valid, hasPhoto: true, description: "On the dog" };
  it("is silent for a recent, complete report", () => {
    expect(computeWarnings(base, NOW)).toEqual([]);
  });
  it("warns about old dates, night-time, unknown species, far pins, no photo, no notes", () => {
    const fields = (o: object) => computeWarnings({ ...base, ...o }, NOW).map((w) => w.field);
    expect(fields({ date: "2024-01-01" })).toContain("date");
    expect(fields({ time: "02:30" })).toContain("time");
    expect(fields({ species: "unknown" })).toContain("species");
    expect(fields({ lat: 55.95, lng: -3.19 })).toContain("city"); // Edinburgh pin, London selected
    expect(fields({ lat: 51.51, lng: -0.12 })).not.toContain("city");
    expect(fields({ hasPhoto: false })).toContain("photo");
    expect(fields({ description: "  " })).toContain("description");
  });
});
