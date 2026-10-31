import { cn } from "@/lib/utils";

const ITEMS = [
  { key: "low", label: "Low", shape: "rounded-full", color: "bg-severity-low", glyph: "L" },
  { key: "medium", label: "Medium", shape: "rounded-[4px] rotate-45", color: "bg-severity-med", glyph: "M" },
  { key: "high", label: "High", shape: "rounded-full rounded-bl-none -rotate-45", color: "bg-severity-high", glyph: "H" },
] as const;

export function MapLegend({ showReports }: { showReports: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border bg-card px-3 py-2 text-xs" aria-label="Map legend" role="group">
      <span className="font-medium text-muted-foreground">Derived severity:</span>
      {ITEMS.map((i) => (
        <span key={i.key} className="flex items-center gap-1.5">
          <span aria-hidden className={cn("flex size-5 items-center justify-center text-[10px] font-bold text-background", i.color, i.shape)}>
            <span className={i.key === "medium" ? "-rotate-45" : i.key === "high" ? "rotate-45" : ""}>{i.glyph}</span>
          </span>
          {i.label}
        </span>
      ))}
      <span className="flex items-center gap-1.5">
        <span aria-hidden className="size-4 rounded-full border-2 border-muted-foreground" />
        Ring = activity in the last 14 days of data
      </span>
      {showReports ? (
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="flex size-4 items-center justify-center rounded-[4px] bg-primary text-[9px] font-bold text-primary-foreground">R</span>
          Community report
        </span>
      ) : null}
    </div>
  );
}
