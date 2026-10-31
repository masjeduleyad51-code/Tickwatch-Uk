import { Database } from "lucide-react";
import { useReports } from "@/hooks/useReports";
import { ReportForm } from "@/components/forms/ReportForm";
import { formatDateTime } from "@/lib/format";
import { getRepository } from "@/services/reports/store";

export default function ReportSighting({ initialCity = "" }: { initialCity?: string }) {
  const { reports, status } = useReports();
  const local = getRepository().kind === "local";
  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <section aria-labelledby="report-heading" className="space-y-5">
        <div>
          <h2 id="report-heading" className="text-2xl font-semibold">Report a sighting</h2>
          <p className="mt-1 text-muted-foreground">Found a tick? Tell us where and when. Reports build a picture of tick activity.</p>
        </div>
        {local ? (
          <p className="flex items-start gap-2 rounded-lg border bg-muted p-3 text-xs text-muted-foreground">
            <Database className="mt-0.5 size-4 shrink-0" aria-hidden />
            Reports are saved in this browser (IndexedDB) because no Supabase project is configured, so only you can see them on this device. See the README to connect a shared database.
          </p>
        ) : null}
        <ReportForm key={initialCity} initialCity={initialCity} />
      </section>
      <aside aria-labelledby="mine-heading" className="space-y-3">
        <h2 id="mine-heading" className="font-semibold">Your saved reports</h2>
        {status === "loading" ? <p className="text-sm text-muted-foreground" role="status">Loading…</p> : null}
        {status !== "loading" && reports.length === 0 ? <p className="text-sm text-muted-foreground">No reports yet.</p> : null}
        <ul className="space-y-2">
          {reports.slice(0, 8).map((r) => (
            <li key={r.id} className="rounded-lg border bg-card p-3 text-sm">
              <p className="font-medium">{r.city} · {r.species === "unknown" ? "Not sure" : r.species}</p>
              <time dateTime={r.occurredAt} className="text-xs text-muted-foreground">{formatDateTime(Date.parse(`${r.occurredAt}Z`))}</time>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
