import type { NewReport, ReportRepository, StoredReport } from "@/types/report";
import { createReportRepository } from "./index";

export type ReportsState =
  | { status: "idle" | "loading"; reports: StoredReport[] }
  | { status: "ready"; reports: StoredReport[] }
  | { status: "error"; reports: StoredReport[]; error: string };

let repo: ReportRepository | null = null;
let state: ReportsState = { status: "idle", reports: [] };
const listeners = new Set<() => void>();

const emit = (next: ReportsState) => {
  state = next;
  listeners.forEach((l) => l());
};

export const getRepository = (): ReportRepository => (repo ??= createReportRepository());
export const getReportsState = (): ReportsState => state;
export const subscribeReports = (l: () => void): (() => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export async function loadReports(): Promise<void> {
  emit({ status: "loading", reports: state.reports });
  try {
    emit({ status: "ready", reports: await getRepository().list() });
  } catch (e) {
    emit({ status: "error", reports: state.reports, error: e instanceof Error ? e.message : "Could not load saved reports." });
  }
}

/** Rejects unless the repository confirms the save; only then is the report added to shared state. */
export async function addReport(report: NewReport): Promise<StoredReport> {
  const saved = await getRepository().add(report);
  emit({ status: "ready", reports: [saved, ...state.reports.filter((r) => r.id !== saved.id)] });
  return saved;
}

/** Test helper. */
export function resetReportsStore(next: ReportRepository | null = null): void {
  repo = next;
  emit({ status: "idle", reports: [] });
}
