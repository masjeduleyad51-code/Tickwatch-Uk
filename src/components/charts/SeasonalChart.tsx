import { useId, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { EmptyState } from "@/components/common/EmptyState";
import { Select } from "@/components/ui/select";
import { availableCities, availableYears, monthlyCounts, peakMonth, selectSightings } from "@/lib/aggregate";
import type { Sighting } from "@/types/sighting";

export function SeasonalChart({ sightings, initialCity = "all", initialYear = "all" }: { sightings: Sighting[]; initialCity?: string; initialYear?: number | "all" }) {
  const uid = useId();
  const cities = useMemo(() => availableCities(sightings), [sightings]);
  const years = useMemo(() => availableYears(sightings), [sightings]);
  const [city, setCity] = useState(initialCity);
  const [year, setYear] = useState<number | "all">(initialYear);

  const query = { city, year };
  const months = useMemo(() => monthlyCounts(sightings, query), [sightings, city, year]); // eslint-disable-line react-hooks/exhaustive-deps
  const total = selectSightings(sightings, query).length;
  const peak = peakMonth(months);
  const where = city === "all" ? "all UK cities" : city;
  const when = year === "all" ? "all years (2012 onwards)" : String(year);
  const title = `Sightings per month: ${where}, ${when}`;

  return (
    <div className="space-y-4">
      <div className="grid max-w-xl gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${uid}-city`} className="mb-1.5 block text-xs font-medium text-muted-foreground">City</label>
          <Select id={`${uid}-city`} value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="all">All cities</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        </div>
        <div>
          <label htmlFor={`${uid}-year`} className="mb-1.5 block text-xs font-medium text-muted-foreground">Year</label>
          <Select id={`${uid}-year`} value={String(year)} onChange={(e) => setYear(e.target.value === "all" ? "all" : Number(e.target.value))}>
            <option value="all">All years</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </Select>
        </div>
      </div>

      <h3 className="font-semibold">{title}</h3>
      {total === 0 ? (
        <EmptyState title="No sightings for this selection" description={`The dataset has no sightings for ${where} in ${when}. Try another year or choose “All years”.`} />
      ) : (
        <>
          <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
            {total} {total === 1 ? "sighting" : "sightings"}.{" "}
            {peak ? `Busiest month: ${peak.label} (${peak.count}).` : ""}
            {total < 15 ? " This is a small sample, so month-to-month differences may be chance." : ""}
          </p>
          <div role="img" aria-label={`${title}. ${months.map((m) => `${m.label} ${m.count}`).join(", ")}.`} className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={months} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                <Tooltip cursor={{ fill: "var(--accent)" }} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Bar dataKey="count" name="Sightings" fill="var(--primary)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <details className="text-sm">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">View chart data as a table</summary>
            <table className="mt-2 w-full max-w-sm text-left text-sm">
              <caption className="sr-only">{title}</caption>
              <thead><tr><th scope="col" className="py-1">Month</th><th scope="col">Sightings</th></tr></thead>
              <tbody>{months.map((m) => <tr key={m.month}><th scope="row" className="py-0.5 font-normal">{m.label}</th><td>{m.count}</td></tr>)}</tbody>
            </table>
          </details>
        </>
      )}
    </div>
  );
}
