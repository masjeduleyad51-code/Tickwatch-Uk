import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { yearlyCounts } from "@/lib/aggregate";
import { formatDate } from "@/lib/format";
import type { Sighting } from "@/types/sighting";

/** Timeline: how activity in one area progressed year by year, plus the most recent events in order. */
export function ActivityTimeline({ city, sightings }: { city: string; sightings: Sighting[] }) {
  const years = yearlyCounts(sightings, city);
  const latest = [...sightings].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
  if (years.length === 0) return <p className="text-sm text-muted-foreground">No dated sightings to chart for {city}.</p>;
  const peak = years.reduce((a, b) => (b.count > a.count ? b : a));
  const summary = `Sightings per year in ${city}, ${years[0]?.year} to ${years[years.length - 1]?.year}. Busiest year ${peak.year} with ${peak.count}.`;

  return (
    <section aria-labelledby="timeline-heading" className="space-y-3">
      <h3 id="timeline-heading" className="font-semibold">Activity timeline</h3>
      <p className="-mt-2 text-xs text-muted-foreground">Every year in the dataset for {city}. The date filter doesn’t apply here; the species filter does.</p>
      <div role="img" aria-label={summary} className="h-40">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart data={years} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="year" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} interval="preserveStartEnd" />
            <YAxis allowDecimals={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
            <Tooltip cursor={{ fill: "var(--accent)" }} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
            <Bar dataKey="count" name="Sightings" fill="var(--primary)" radius={[3, 3, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <details className="text-sm">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">View as table</summary>
        <table className="mt-2 w-full text-left text-xs">
          <caption className="sr-only">{summary}</caption>
          <thead><tr><th scope="col" className="py-1">Year</th><th scope="col">Sightings</th></tr></thead>
          <tbody>{years.map((y) => <tr key={y.year}><th scope="row" className="py-0.5 font-normal">{y.year}</th><td>{y.count}</td></tr>)}</tbody>
        </table>
      </details>
      <div>
        <h4 className="mb-1.5 text-sm font-medium">Most recent activity</h4>
        <ol className="space-y-1.5 border-l border-border pl-4">
          {latest.map((s) => (
            <li key={s.id} className="relative text-sm">
              <span aria-hidden className="absolute -left-[21px] top-1.5 size-2 rounded-full bg-primary" />
              <time dateTime={s.occurredAt} className="font-medium">{formatDate(s.timestamp)}</time>
              <span className="text-muted-foreground"> · {s.species}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
