import { formatDate, formatNumber } from "@/lib/format";
import type { SightingsSummary } from "@/lib/summary";

export function DatasetSummary({ summary, label = "Sightings loaded" }: { summary: SightingsSummary; label?: string }) {
  const range =
    summary.firstTimestamp !== null && summary.lastTimestamp !== null
      ? `${formatDate(summary.firstTimestamp)} – ${formatDate(summary.lastTimestamp)}`
      : "–";

  const tiles = [
    { label, value: formatNumber(summary.total) },
    { label: "Cities", value: formatNumber(summary.cityCount) },
    { label: "Species", value: formatNumber(summary.speciesCount) },
    { label: "Date range", value: range },
  ];

  return (
    <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map((tile) => (
        <div key={tile.label} className="rounded-xl border bg-card p-4">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">{tile.label}</dt>
          <dd className="mt-1 text-lg font-semibold">{tile.value}</dd>
        </div>
      ))}
    </dl>
  );
}
