import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, LoaderCircle, MapPinOff, TriangleAlert } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { LocationPicker } from "@/components/map/LocationPicker";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SPECIES_GUIDE, getSpecies } from "@/data/species";
import { UK_CITIES, getCityInfo } from "@/data/ukCities";
import { computeWarnings } from "@/lib/reportWarnings";
import { buildHash } from "@/lib/route";
import { MAX_DESCRIPTION, makeReportSchema, type ReportFormValues } from "@/schemas/reportSchema";
import { addReport, getRepository } from "@/services/reports/store";
import type { StoredReport } from "@/types/report";
import { PhotoField } from "./PhotoField";

const pad = (n: number) => String(n).padStart(2, "0");
export const todayLocal = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const newId = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `r-${Date.now()}-${Math.random().toString(16).slice(2)}`);

/** Rebuilt on every submit so "not in the future" uses the real current time, not the time the page loaded. */
const resolver: Resolver<ReportFormValues> = (values, ctx, opts) => zodResolver(makeReportSchema(new Date()))(values, ctx, opts);

export function ReportForm({ initialCity = "" }: { initialCity?: string }) {
  const { register, handleSubmit, watch, setValue, reset, formState: { errors, touchedFields, submitCount, isSubmitting } } = useForm<ReportFormValues>({
    resolver,
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { date: "", time: "", city: getCityInfo(initialCity) ? initialCity : "", species: "", description: "", lat: null, lng: null },
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saved, setSaved] = useState<StoredReport | null>(null);
  // One id per attempt: retrying after a network failure re-sends the SAME id, so it can never create a duplicate.
  const attemptId = useRef(newId());
  const inFlight = useRef(false);

  const v = watch();
  const warnings = useMemo(
    () => computeWarnings({ ...v, lat: v.lat, lng: v.lng, hasPhoto: photo !== null }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [v.date, v.time, v.city, v.species, v.description, v.lat, v.lng, photo],
  );
  const warn = (field: string, always = true) => (always ? warnings.find((w) => w.field === field)?.message : undefined);
  const submitted = submitCount > 0;

  async function onSubmit(values: ReportFormValues) {
    if (inFlight.current || photoError) return;
    inFlight.current = true;
    setSubmitError(null);
    try {
      const centre = getCityInfo(values.city)?.coordinates;
      const picked = values.lat !== null && values.lng !== null;
      const lat = picked ? values.lat : centre?.lat;
      const lng = picked ? values.lng : centre?.lng;
      if (lat == null || lng == null) throw new Error("That city has no coordinates.");
      const result = await addReport({
        id: attemptId.current,
        occurredAt: `${values.date}T${values.time}:00`,
        city: values.city,
        species: values.species,
        latinName: getSpecies(values.species)?.latinName ?? "",
        lat, lng,
        approximateLocation: !picked,
        description: values.description.trim(),
        photo,
      });
      setSaved(result);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Something went wrong while saving.");
    } finally {
      inFlight.current = false;
    }
  }

  function another() {
    reset({ date: "", time: "", city: "", species: "", description: "", lat: null, lng: null });
    setPhoto(null); setPhotoError(null); setSaved(null); setSubmitError(null);
    attemptId.current = newId();
  }

  if (saved) {
    const where = getRepository().kind === "supabase" ? "the TickWatch database" : "this browser’s local storage";
    return (
      <div role="status" className="space-y-4 rounded-xl border border-severity-low/50 bg-severity-low/10 p-6">
        <h2 className="flex items-center gap-2 text-xl font-semibold"><CircleCheck className="size-6 text-severity-low" aria-hidden /> Report saved</h2>
        <p className="text-sm">
          Thank you. Your {saved.species === "unknown" ? "sighting" : saved.species.toLowerCase()} report for {saved.city} was confirmed saved to {where}
          {saved.photo ? ", with your photo" : ""}. It now appears on the map as a community report.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild><a href={buildHash("explore", { city: saved.city })}>See it on the map</a></Button>
          <Button variant="outline" onClick={another}>Report another</Button>
        </div>
      </div>
    );
  }

  const errorCount = Object.keys(errors).length + (photoError ? 1 : 0);
  const pin = v.lat !== null && v.lng !== null ? { lat: v.lat, lng: v.lng } : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6" aria-describedby="form-summary">
      <p id="form-summary" className="text-sm text-muted-foreground">Fields marked <span className="text-destructive">*</span> are required.</p>

      {errorCount > 0 && submitted ? (
        <div role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
          <p>Please fix {errorCount} {errorCount === 1 ? "problem" : "problems"} below, then submit again.</p>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="date" label="Date seen" required error={errors.date?.message} warning={warn("date")}>
          {(aria) => <Input type="date" max={todayLocal()} {...aria} {...register("date")} />}
        </Field>
        <Field id="time" label="Approximate time" required hint="24-hour time, e.g. 14:30" error={errors.time?.message} warning={warn("time")}>
          {(aria) => <Input type="time" {...aria} {...register("time")} />}
        </Field>
        <Field id="city" label="Nearest city" required error={errors.city?.message} warning={warn("city")}>
          {(aria) => (
            <Select {...aria} {...register("city")}>
              <option value="">Choose a city…</option>
              {UK_CITIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
            </Select>
          )}
        </Field>
        <Field id="species" label="Species" required hint="Not sure? Choose “Not sure” and add a photo." error={errors.species?.message} warning={warn("species")}>
          {(aria) => (
            <Select {...aria} {...register("species")}>
              <option value="">Choose a species…</option>
              {SPECIES_GUIDE.map((s) => <option key={s.name} value={s.name}>{s.name} ({s.latinName})</option>)}
              <option value="unknown">Not sure</option>
            </Select>
          )}
        </Field>
      </div>

      <fieldset className="space-y-2 rounded-lg border p-4">
        <legend className="px-1 text-sm font-medium">Exact spot on the map <span className="text-xs font-normal text-muted-foreground">(optional)</span></legend>
        <p className="text-xs text-muted-foreground">
          Click the map to drop a pin. Without one, your report is placed at the city centre and marked as approximate. The map needs a mouse or touch; keyboard users can skip it.
        </p>
        <LocationPicker value={pin} onPick={(lat, lng) => { setValue("lat", lat, { shouldDirty: true }); setValue("lng", lng, { shouldDirty: true }); }} />
        <div className="flex items-center justify-between gap-3 text-sm" aria-live="polite">
          <span>{pin ? `Pin at ${pin.lat.toFixed(4)}, ${pin.lng.toFixed(4)}` : "No pin: city centre will be used."}</span>
          {pin ? <Button type="button" variant="ghost" size="sm" onClick={() => { setValue("lat", null); setValue("lng", null); }}><MapPinOff aria-hidden /> Clear pin</Button> : null}
        </div>
      </fieldset>

      <Field id="description" label="Notes" hint={`${v.description.length}/${MAX_DESCRIPTION}. Where was it found? On a pet, a person, or in the garden?`} error={errors.description?.message} warning={warn("description", submitted || Boolean(touchedFields.description))}>
        {(aria) => <Textarea {...aria} {...register("description")} />}
      </Field>

      <PhotoField file={photo} error={photoError} warning={warn("photo", submitted)} onChange={(f, err) => { setPhoto(f); setPhotoError(err); }} />

      {submitError ? (
        <div role="alert" className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm">
          <p className="font-medium">Your report was not saved.</p>
          <p className="text-muted-foreground">{submitError} Check your connection and try again. Nothing has been submitted twice.</p>
        </div>
      ) : null}

      <Button type="submit" size="lg" disabled={isSubmitting} aria-busy={isSubmitting}>
        {isSubmitting ? <><LoaderCircle className="animate-spin" aria-hidden /> Saving…</> : "Submit report"}
      </Button>
    </form>
  );
}
