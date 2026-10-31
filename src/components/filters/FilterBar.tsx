import { Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SPECIES_NAMES } from "@/data/species";
import { DATE_PRESETS, DEFAULT_FILTERS, RECENT_DAYS, SEVERITY_LABEL, activeFilterCount, isInvalidCustomRange, type DatePreset, type Filters, type Severity } from "@/lib/filters";

function Label({ htmlFor, children }: { htmlFor: string; children: string }) {
  return <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium text-muted-foreground">{children}</label>;
}

export function FilterBar({ filters, onChange, dataEndLabel }: { filters: Filters; onChange: (next: Filters) => void; dataEndLabel: string | null }) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => onChange({ ...filters, [key]: value });
  const count = activeFilterCount(filters);
  const invalid = isInvalidCustomRange(filters);

  return (
    <section aria-labelledby="filters-heading" className="rounded-xl border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 id="filters-heading" className="flex items-center gap-2 font-semibold">
          <Filter className="size-4 text-primary" aria-hidden />
          Filters{count > 0 ? <span className="rounded-full bg-primary/15 px-2 text-xs text-primary">{count} active</span> : null}
        </h2>
        <Button variant="ghost" size="sm" onClick={() => onChange(DEFAULT_FILTERS)} disabled={count === 0}>
          <RotateCcw aria-hidden /> Reset
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label htmlFor="f-date">Date range</Label>
          <Select id="f-date" value={filters.datePreset} onChange={(e) => set("datePreset", e.target.value as DatePreset)}>
            {DATE_PRESETS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </Select>
        </div>
        <div>
          <Label htmlFor="f-species">Species</Label>
          <Select id="f-species" value={filters.species} onChange={(e) => set("species", e.target.value)}>
            <option value="all">Any species</option>
            {SPECIES_NAMES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </div>
        <div>
          <Label htmlFor="f-severity">Severity (derived)</Label>
          <Select id="f-severity" value={filters.severity} onChange={(e) => set("severity", e.target.value as Severity | "all")}>
            <option value="all">Any severity</option>
            {(Object.keys(SEVERITY_LABEL) as Severity[]).map((s) => <option key={s} value={s}>{SEVERITY_LABEL[s]}</option>)}
          </Select>
        </div>
        <div className="flex items-end">
          <label className="flex min-h-10 cursor-pointer items-center gap-3 text-sm">
            <input
              type="checkbox"
              role="switch"
              checked={filters.recentOnly}
              onChange={(e) => set("recentOnly", e.target.checked)}
              className="size-5 accent-[var(--primary)]"
            />
            <span>Recent only <span className="text-muted-foreground">(last {RECENT_DAYS} days of data)</span></span>
          </label>
        </div>
      </div>
      {filters.datePreset === "custom" ? (
        <div className="mt-4 grid max-w-md grid-cols-2 gap-4">
          <div>
            <Label htmlFor="f-from">From</Label>
            <Input id="f-from" type="date" value={filters.from} max={filters.to || undefined} onChange={(e) => set("from", e.target.value)} aria-invalid={invalid} />
          </div>
          <div>
            <Label htmlFor="f-to">To</Label>
            <Input id="f-to" type="date" value={filters.to} min={filters.from || undefined} onChange={(e) => set("to", e.target.value)} aria-invalid={invalid} />
          </div>
          {invalid ? <p role="alert" className="col-span-2 text-sm text-destructive">The start date must be before the end date.</p> : null}
        </div>
      ) : null}
      {dataEndLabel ? (
        <p className="mt-3 text-xs text-muted-foreground">
          “Last 30 days”, “Recent” and similar ranges count back from the newest sighting in the dataset ({dataEndLabel}), not from today.
        </p>
      ) : null}
    </section>
  );
}
