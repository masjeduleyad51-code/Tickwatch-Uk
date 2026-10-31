import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatNumber } from "@/lib/format";
import { isRecent, type CityStat } from "@/lib/filters";
import { cn } from "@/lib/utils";
import type { Sighting } from "@/types/sighting";
import { SeverityBadge } from "./SeverityBadge";

const PAGE = 25;

export function ResultsList({
  sightings, cities, end, selectedId, onSelect,
}: {
  sightings: Sighting[];
  cities: CityStat[];
  end: number | null;
  selectedId: string | null;
  onSelect: (s: Sighting) => void;
}) {
  const [shown, setShown] = useState(PAGE);
  const severityOf = new Map(cities.map((c) => [c.city, c.severity] as const));
  const visible = sightings.slice(0, shown);

  return (
    <section aria-labelledby="results-heading" className="flex min-h-0 flex-col rounded-xl border bg-card">
      <div className="border-b p-4">
        <h2 id="results-heading" className="font-semibold">Results</h2>
        <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
          {formatNumber(sightings.length)} sightings in {cities.length} {cities.length === 1 ? "city" : "cities"}, newest first
        </p>
      </div>
      <ul className="max-h-[32rem] flex-1 space-y-2 overflow-y-auto p-3">
        {visible.map((s) => {
          const sev = severityOf.get(s.city);
          const selected = s.id === selectedId;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onSelect(s)}
                aria-pressed={selected}
                className={cn(
                  "w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selected ? "border-primary bg-primary/10" : "border-border",
                )}
              >
                <span className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">{s.city}</span>
                  <span className="flex items-center gap-2">
                    {isRecent(s.timestamp, end) ? <Badge variant="secondary">Recent</Badge> : null}
                    {sev ? <SeverityBadge severity={sev} /> : null}
                  </span>
                </span>
                <span className="mt-1 block text-sm">{s.species} <span className="italic text-muted-foreground">· {s.latinName}</span></span>
                <time dateTime={s.occurredAt} className="mt-1 block text-xs text-muted-foreground">{formatDate(s.timestamp)}</time>
              </button>
            </li>
          );
        })}
      </ul>
      {shown < sightings.length ? (
        <div className="border-t p-3">
          <Button variant="outline" className="w-full" onClick={() => setShown((n) => n + PAGE)}>
            Show more ({formatNumber(sightings.length - shown)} left)
          </Button>
        </div>
      ) : null}
    </section>
  );
}
