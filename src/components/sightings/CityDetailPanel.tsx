import { ArrowLeft, FileImage, MapPin } from "lucide-react";
import { useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { speciesBreakdown } from "@/lib/aggregate";
import { formatDate, formatDateTime, formatNumber } from "@/lib/format";
import type { CityStat } from "@/lib/filters";
import type { StoredReport } from "@/types/report";
import type { Sighting } from "@/types/sighting";
import { ActivityTimeline } from "./ActivityTimeline";
import { QuickActions } from "./QuickActions";
import { SeverityBadge } from "./SeverityBadge";

interface Props {
  city: string;
  stat: CityStat | undefined;
  /** This city's sightings that pass the current filters. */
  filtered: Sighting[];
  /** This city's sightings ignoring date/severity filters (species filter applied) for the timeline. */
  timelineSource: Sighting[];
  selectedSighting: Sighting | null;
  onSelectSighting: (s: Sighting) => void;
  reports: StoredReport[];
  onClose: () => void;
}

export function CityDetailPanel({ city, stat, filtered, timelineSource, selectedSighting, onSelectSighting, reports, onClose }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { headingRef.current?.focus(); }, [city]);
  const species = speciesBreakdown(filtered);
  const coordinates = stat?.coordinates ?? filtered[0]?.coordinates ?? timelineSource[0]?.coordinates ?? null;

  return (
    <aside aria-labelledby="detail-heading" className="space-y-5 rounded-xl border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="detail-heading" ref={headingRef} tabIndex={-1} className="flex items-center gap-2 text-xl font-semibold focus:outline-none">
            <MapPin className="size-5 text-primary" aria-hidden /> {city}
          </h2>
          {stat ? (
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {formatNumber(stat.count)} sightings in view · <SeverityBadge severity={stat.severity} />
              {stat.recentCount > 0 ? <Badge variant="secondary">{stat.recentCount} recent</Badge> : null}
            </p>
          ) : (
            <p role="status" className="mt-1 text-sm text-severity-med">No sightings in {city} match the current filters. Showing its full history below.</p>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}><ArrowLeft aria-hidden /> All results</Button>
      </div>

      {stat ? (
        <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
          Severity is derived by this app, not provided by the API: cities are ranked by number of sightings in the current view and split into thirds.
        </p>
      ) : null}

      <QuickActions city={city} coordinates={coordinates} />

      {selectedSighting ? (
        <section aria-labelledby="sighting-heading" className="rounded-lg border border-primary/40 bg-primary/5 p-3">
          <h3 id="sighting-heading" className="mb-2 font-semibold">Selected sighting</h3>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="text-muted-foreground">Species</dt><dd>{selectedSighting.species}</dd>
            <dt className="text-muted-foreground">Latin name</dt><dd className="italic">{selectedSighting.latinName}</dd>
            <dt className="text-muted-foreground">Date and time</dt>
            <dd><time dateTime={selectedSighting.occurredAt}>{formatDateTime(selectedSighting.timestamp)}</time></dd>
            <dt className="text-muted-foreground">Location</dt><dd>{selectedSighting.city} (city only; the API has no street-level data)</dd>
            <dt className="text-muted-foreground">Record ID</dt><dd className="break-all font-mono text-xs">{selectedSighting.id}</dd>
          </dl>
        </section>
      ) : null}

      {species.length > 0 ? (
        <section aria-labelledby="species-heading">
          <h3 id="species-heading" className="mb-2 font-semibold">Species in view</h3>
          <ul className="space-y-1 text-sm">
            {species.map((s) => (
              <li key={s.species} className="flex items-center gap-3">
                <span className="w-36 shrink-0 truncate">{s.species}</span>
                <span aria-hidden className="h-2 flex-1 overflow-hidden rounded bg-muted"><span className="block h-full bg-primary" style={{ width: `${(s.count / (species[0]?.count ?? 1)) * 100}%` }} /></span>
                <span className="w-6 text-right tabular-nums">{s.count}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <ActivityTimeline city={city} sightings={timelineSource} />

      {filtered.length > 0 ? (
        <section aria-labelledby="city-list-heading">
          <h3 id="city-list-heading" className="mb-2 font-semibold">Sightings in {city}</h3>
          <ul className="max-h-60 space-y-1.5 overflow-y-auto">
            {filtered.slice(0, 30).map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  aria-pressed={selectedSighting?.id === s.id}
                  onClick={() => onSelectSighting(s)}
                  className="w-full rounded-md border border-border px-3 py-2 text-left text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-pressed:border-primary aria-pressed:bg-primary/10"
                >
                  {s.species} <span className="text-muted-foreground">· {formatDate(s.timestamp)}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {reports.length > 0 ? (
        <section aria-labelledby="reports-heading">
          <h3 id="reports-heading" className="mb-2 font-semibold">Community reports in {city}</h3>
          <p className="mb-2 text-xs text-muted-foreground">Saved by users of this app. They are not part of the Elanco dataset and don’t affect severity.</p>
          <ul className="space-y-2">
            {reports.map((r) => (
              <li key={r.id} className="rounded-md border border-border p-3 text-sm">
                <p className="font-medium">{r.species === "unknown" ? "Species not sure" : r.species}</p>
                <time dateTime={r.occurredAt} className="text-xs text-muted-foreground">{formatDateTime(Date.parse(`${r.occurredAt}Z`))}</time>
                {r.description ? <p className="mt-1">{r.description}</p> : null}
                {r.photo ? (
                  <a href={r.photo.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-primary underline">
                    <FileImage className="size-3.5" aria-hidden /> View photo ({r.photo.name})
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </aside>
  );
}
