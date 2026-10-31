import { AppHeader } from "@/components/layout/AppHeader";
import { useRoute } from "@/hooks/useRoute";
import { useSightings } from "@/hooks/useSightings";
import { Suspense, lazy, useEffect } from "react";
import { LoadingState } from "@/components/common/LoadingState";

// Route-level code splitting keeps Leaflet and Recharts out of the first paint of pages that don't need them.
const Explore = lazy(() => import("@/pages/Explore"));
const Learn = lazy(() => import("@/pages/Learn"));
const ReportSighting = lazy(() => import("@/pages/ReportSighting"));

const TITLES = { explore: "Explore tick sightings", report: "Report a tick sighting", learn: "Learn about ticks" } as const;

export default function App() {
  const route = useRoute();
  useEffect(() => { document.title = `${TITLES[route.name]} · TickWatch UK`; }, [route.name]);
  const { state, refetch } = useSightings();

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <a
        href="#main"
        onClick={(e) => { e.preventDefault(); document.getElementById("main")?.focus(); }}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[2000] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to main content
      </a>
      <AppHeader current={route.name} />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-7xl px-4 py-6 focus:outline-none sm:px-6">
        <h1 className="sr-only">{TITLES[route.name]}</h1>
        <Suspense fallback={<LoadingState label="Loading…" />}>
        {route.name === "explore" ? <Explore state={state} onRetry={refetch} initialCity={route.params.get("city")} /> : null}
        {route.name === "report" ? <ReportSighting initialCity={route.params.get("city") ?? ""} /> : null}
        {route.name === "learn" ? <Learn state={state} onRetry={refetch} initialTab={route.params.get("tab")} /> : null}
        </Suspense>
      </main>
      <footer className="mx-auto max-w-7xl px-4 pb-8 text-xs text-muted-foreground sm:px-6">
        Sighting data: Elanco Tick Sightings API. City positions are approximate city centres. Severity is derived by this app. Map © OpenStreetMap contributors.
      </footer>
    </div>
  );
}
