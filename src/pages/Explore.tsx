import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { FilterBar } from "@/components/filters/FilterBar";
import { MapLegend } from "@/components/map/MapLegend";
import { SightingsMap } from "@/components/map/SightingsMap";
import { CityDetailPanel } from "@/components/sightings/CityDetailPanel";
import { DatasetSummary } from "@/components/sightings/DatasetSummary";
import { ResultsList } from "@/components/sightings/ResultsList";
import { Button } from "@/components/ui/button";
import { useReports } from "@/hooks/useReports";
import type { SightingsState } from "@/hooks/useSightings";
import { DEFAULT_FILTERS, applyFilters, filterSightings, isInvalidCustomRange, type Filters } from "@/lib/filters";
import { formatDate, formatNumber } from "@/lib/format";
import { summarise } from "@/lib/summary";
import { TriangleAlert } from "lucide-react";
import type { Sighting } from "@/types/sighting";

interface Props {
  state: SightingsState;
  onRetry: () => void;
  initialCity?: string | null;
}

export default function Explore({ state, onRetry, initialCity = null }: Props) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [city, setCity] = useState<string | null>(initialCity);
  const [sightingId, setSightingId] = useState<string | null>(null);
  const reports = useReports();

  useEffect(() => { setCity(initialCity); setSightingId(null); }, [initialCity]);

  const all = useMemo(() => (state.status === "success" ? state.data.sightings : []), [state]);
  const view = useMemo(() => applyFilters(all, filters), [all, filters]);

  if (state.status === "loading") return <LoadingState />;
  if (state.status === "error") return <ErrorState error={state.error} onRetry={onRetry} />;
  if (state.status === "empty") {
    return <EmptyState title="No sightings to show" description="The API returned no tick sightings. Try again later." action={<Button variant="outline" onClick={onRetry}>Reload</Button>} />;
  }

  const { skippedRecords, unmappedCities } = state.data;
  const stat = view.cities.find((c) => c.city === city);
  const selectedSighting = view.sightings.find((s) => s.id === sightingId) ?? all.find((s) => s.id === sightingId) ?? null;
  const cityReports = reports.reports.filter((r) => r.city === city);
  const notes: string[] = [];
  if (skippedRecords > 0) notes.push(`${formatNumber(skippedRecords)} record(s) were skipped because they were not in the expected format.`);
  if (unmappedCities.length > 0) notes.push(`These cities have no map coordinates and are hidden from the map: ${unmappedCities.join(", ")}.`);
  const end = view.end;

  function selectSighting(s: Sighting) {
    setCity(s.city);
    setSightingId(s.id);
    history.replaceState(null, "", `#/explore?city=${encodeURIComponent(s.city)}`);
  }
  function selectCity(name: string) {
    setCity(name);
    setSightingId(null);
    history.replaceState(null, "", `#/explore?city=${encodeURIComponent(name)}`);
  }
  function closePanel() {
    setCity(null);
    setSightingId(null);
    history.replaceState(null, "", "#/explore");
  }

  const timelineSource = city ? filterSightings(all.filter((s) => s.city === city), { ...DEFAULT_FILTERS, species: filters.species }) : [];

  return (
    <div className="space-y-5">
      <DatasetSummary summary={summarise(view.sightings)} label="Sightings in view" />
      {notes.length > 0 ? (
        <div role="status" className="flex items-start gap-2 rounded-lg border border-severity-med/40 bg-severity-med/10 p-3 text-sm">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-severity-med" aria-hidden />
          <p>{notes.join(" ")}</p>
        </div>
      ) : null}
      <FilterBar filters={filters} onChange={(f) => setFilters(f)} dataEndLabel={end !== null ? formatDate(end) : null} />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_24rem] xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="space-y-3">
          <div className="relative h-[60vh] min-h-[24rem] overflow-hidden rounded-xl border lg:h-[44rem]" data-testid="map-region">
            <h2 className="sr-only">Map of tick sightings</h2>
            <SightingsMap cities={view.cities} reports={reports.reports} selectedCity={city} onSelectCity={selectCity} />
            {view.cities.length === 0 ? (
              <div role="status" className="pointer-events-none absolute inset-0 z-[500] grid place-items-center bg-background/70 p-6 text-center">
                <p className="max-w-xs text-sm">No sightings match these filters. Try widening the date range or resetting the filters.</p>
              </div>
            ) : null}
          </div>
          <MapLegend showReports={reports.reports.length > 0} />
          {isInvalidCustomRange(filters) ? <p role="alert" className="text-sm text-destructive">Fix the date range to see results.</p> : null}
          {reports.status === "error" ? <p role="alert" className="text-sm text-severity-med">Couldn’t load community reports: {reports.error}</p> : null}
        </div>

        {city ? (
          <CityDetailPanel
            city={city}
            stat={stat}
            filtered={view.sightings.filter((s) => s.city === city)}
            timelineSource={timelineSource}
            selectedSighting={selectedSighting}
            onSelectSighting={selectSighting}
            reports={cityReports}
            onClose={closePanel}
          />
        ) : view.sightings.length === 0 ? (
          <EmptyState title="No matching sightings" description="Nothing in the dataset matches these filters." action={<Button variant="outline" onClick={() => setFilters(DEFAULT_FILTERS)}>Reset filters</Button>} />
        ) : (
          <ResultsList sightings={view.sightings} cities={view.cities} end={end} selectedId={sightingId} onSelect={selectSighting} />
        )}
      </div>
    </div>
  );
}
