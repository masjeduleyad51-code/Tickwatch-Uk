import { SEVERITY_LABEL, type Severity } from "@/lib/filters";
import { cn } from "@/lib/utils";

const STYLE: Record<Severity, string> = {
  low: "bg-severity-low/15 text-severity-low",
  medium: "bg-severity-med/15 text-severity-med",
  high: "bg-severity-high/15 text-severity-high",
};
const SHAPE: Record<Severity, string> = { low: "rounded-full", medium: "rotate-45 rounded-[2px]", high: "rounded-full rounded-bl-none -rotate-45" };
const DOT: Record<Severity, string> = { low: "bg-severity-low", medium: "bg-severity-med", high: "bg-severity-high" };

/** Colour + shape + text, so severity is never conveyed by colour alone. */
export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium", STYLE[severity])}>
      <span aria-hidden className={cn("size-2.5", DOT[severity], SHAPE[severity])} />
      {SEVERITY_LABEL[severity]}
    </span>
  );
}
