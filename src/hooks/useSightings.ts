import { useCallback, useEffect, useState } from "react";
import { toApiError, type ApiError } from "@/services/api/errors";
import { loadSightings } from "@/services/sightingsService";
import type { MappedSightings } from "@/types/sighting";

export type SightingsState =
  | { status: "loading" }
  | { status: "error"; error: ApiError }
  | { status: "empty"; data: MappedSightings }
  | { status: "success"; data: MappedSightings };

/**
 * Loads all sightings once (the service caches the request) and exposes a
 * discriminated-union state so components must handle every case.
 */
export function useSightings(): { state: SightingsState; refetch: () => void } {
  const [state, setState] = useState<SightingsState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setState({ status: "loading" });

    loadSightings({ force: attempt > 0 })
      .then((data) => {
        if (!active) return;
        setState(data.sightings.length === 0 ? { status: "empty", data } : { status: "success", data });
      })
      .catch((error: unknown) => {
        if (!active) return;
        setState({ status: "error", error: toApiError(error) });
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  const refetch = useCallback(() => setAttempt((n) => n + 1), []);
  return { state, refetch };
}
