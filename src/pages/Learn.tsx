import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { ErrorState } from "@/components/common/ErrorState";
import { SeasonalChart } from "@/components/charts/SeasonalChart";
import { PreventionTips } from "@/components/learn/PreventionTips";
import { SpeciesGuide } from "@/components/learn/SpeciesGuide";
import { Tabs } from "@/components/ui/tabs";
import type { SightingsState } from "@/hooks/useSightings";

export const LEARN_TABS = ["species", "prevention", "seasonal"] as const;
type LearnTab = (typeof LEARN_TABS)[number];

export default function Learn({ state, onRetry, initialTab }: { state: SightingsState; onRetry: () => void; initialTab?: string | null }) {
  const [tab, setTab] = useState<LearnTab>(LEARN_TABS.find((t) => t === initialTab) ?? "species");
  const sightings = state.status === "success" ? state.data.sightings : [];

  const dataNote = (content: React.ReactNode) =>
    state.status === "loading" ? (
      <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" aria-hidden /> Loading sighting data…</p>
    ) : state.status === "error" ? (
      <ErrorState error={state.error} onRetry={onRetry} />
    ) : (
      content
    );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Learn about ticks</h2>
        <p className="mt-1 text-muted-foreground">Identify common species, protect yourself and your pets, and see when sightings are reported.</p>
      </div>
      <Tabs
        label="Learn sections"
        value={tab}
        onChange={(id) => setTab(id as LearnTab)}
        tabs={[
          { id: "species", label: "Species guide", content: <SpeciesGuide sightings={sightings} /> },
          { id: "prevention", label: "Prevention tips", content: <PreventionTips /> },
          { id: "seasonal", label: "Seasonal activity", content: dataNote(<SeasonalChart sightings={sightings} />) },
        ]}
      />
    </div>
  );
}
