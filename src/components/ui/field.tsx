import type { ReactNode } from "react";
import { CircleAlert, TriangleAlert } from "lucide-react";

/** Label + control + hint + error + warning, wired with ids so screen readers announce all of it. */
export function Field({
  id, label, required, hint, error, warning, children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string | undefined;
  warning?: string | undefined;
  children: (aria: { id: string; "aria-describedby": string | undefined; "aria-invalid": boolean }) => ReactNode;
}) {
  const ids = [hint ? `${id}-hint` : null, error ? `${id}-error` : null, !error && warning ? `${id}-warn` : null].filter(Boolean);
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {required ? <span className="ml-1 text-destructive" aria-hidden>*</span> : <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>}
      </label>
      {children({ id, "aria-describedby": ids.length ? ids.join(" ") : undefined, "aria-invalid": Boolean(error) })}
      {hint ? <p id={`${id}-hint`} className="text-xs text-muted-foreground">{hint}</p> : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="flex items-start gap-1.5 text-sm text-destructive">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span><span className="sr-only">Error: </span>{error}</span>
        </p>
      ) : null}
      {!error && warning ? (
        <p id={`${id}-warn`} className="flex items-start gap-1.5 text-sm text-severity-med">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span><span className="sr-only">Warning: </span>{warning}</span>
        </p>
      ) : null}
    </div>
  );
}
