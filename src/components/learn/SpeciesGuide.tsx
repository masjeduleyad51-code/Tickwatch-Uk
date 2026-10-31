import { SPECIES_GUIDE } from "@/data/species";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/format";
import type { Sighting } from "@/types/sighting";

export function SpeciesGuide({ sightings }: { sightings: Sighting[] }) {
  const counts = new Map<string, number>();
  for (const s of sightings) counts.set(s.species, (counts.get(s.species) ?? 0) + 1);

  return (
    <div className="space-y-5">
      <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
        <strong className="text-foreground">General guidance, not identification.</strong> These notes are based on each species’ common name and genus. Sighting counts come from the Elanco dataset. The tick most often linked to Lyme disease in the UK, the sheep tick (<i>Ixodes ricinus</i>), is not labelled in this dataset. Never rely on this page to decide whether a bite is risky; follow the prevention and symptom advice instead.
      </p>
      <ul className="grid gap-4 md:grid-cols-2">
        {SPECIES_GUIDE.map((s) => {
          const n = counts.get(s.name);
          return (
            <li key={s.name} className="space-y-3 rounded-xl border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{s.name}</h3>
                  <p className="italic text-muted-foreground">{s.latinName}</p>
                </div>
                <Badge variant="outline">{n === undefined ? "Loading…" : `${formatNumber(n)} sightings`}</Badge>
              </div>
              <p className="text-sm">{s.summary}</p>
              <dl className="space-y-1.5 text-sm">
                <div><dt className="inline font-medium">Typically feeds on: </dt><dd className="inline text-muted-foreground">{s.likelyHosts}</dd></div>
                <div><dt className="inline font-medium">Where to check: </dt><dd className="inline text-muted-foreground">{s.whereToLook}</dd></div>
              </dl>
            </li>
          );
        })}
      </ul>
      <section aria-labelledby="stages-heading" className="rounded-xl border bg-card p-5">
        <h3 id="stages-heading" className="font-semibold">Is it a tick?</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Ticks are small, spider-like animals with eight legs that feed on blood. Young ticks can be as small as a poppy seed, so check carefully, especially skin folds, behind the knees, the groin, armpits and the hairline. On pets, check ears, neck and between the toes.
        </p>
      </section>
    </div>
  );
}
