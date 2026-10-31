import { useEffect, useSyncExternalStore } from "react";
import { getReportsState, loadReports, subscribeReports } from "@/services/reports/store";

export function useReports() {
  const state = useSyncExternalStore(subscribeReports, getReportsState, getReportsState);
  useEffect(() => {
    if (getReportsState().status === "idle") void loadReports();
  }, []);
  return state;
}
