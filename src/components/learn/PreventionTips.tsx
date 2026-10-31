import { ExternalLink } from "lucide-react";
import { SOURCES } from "@/data/sources";

const BEFORE = [
  "Stick to paths where you can, and avoid brushing through long grass and bracken.",
  "Cover your skin and tuck trousers into your socks.",
  "Use insect repellent on your clothes and skin.",
  "Ask your vet about tick prevention for dogs and cats, and keep it up to date.",
];
const AFTER = [
  "Check your skin and your children’s skin after being outdoors, including skin folds and the hairline.",
  "Check pets after walks: ears, neck, belly and between the toes.",
  "Check clothing, pet blankets and bags before taking them inside.",
];
const REMOVE = [
  "Use fine-tipped tweezers or a tick-removal tool, not your fingernails.",
  "Grip the tick as close to the skin as you can, and pull steadily away from the skin. Don’t squeeze or crush it.",
  "Clean the bite with soap and water or antiseptic, and wash your hands.",
  "Note the date of the bite and keep an eye on the area.",
];

function Card({ title, items, id }: { title: string; items: string[]; id: string }) {
  return (
    <section aria-labelledby={id} className="rounded-xl border bg-card p-5">
      <h3 id={id} className="mb-3 font-semibold">{title}</h3>
      <ul className="list-disc space-y-2 pl-5 text-sm marker:text-primary">{items.map((t) => <li key={t}>{t}</li>)}</ul>
    </section>
  );
}

export function PreventionTips() {
  return (
    <div className="space-y-5">
      <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
        <strong className="text-foreground">General health guidance</strong>, not drawn from the sighting data. Most tick bites are harmless, but removing a tick promptly reduces the risk of infections such as Lyme disease.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        <Card id="tips-before" title="Before you go out" items={BEFORE} />
        <Card id="tips-after" title="When you come back" items={AFTER} />
        <Card id="tips-remove" title="If you find a tick" items={REMOVE} />
      </div>
      <section aria-labelledby="tips-symptoms" className="rounded-xl border border-severity-med/40 bg-severity-med/5 p-5">
        <h3 id="tips-symptoms" className="mb-2 font-semibold">When to get medical advice</h3>
        <p className="text-sm">
          A circular or oval red rash around the bite can appear up to 3 months later, although most appear within 4 weeks. See your GP if you develop a rash, a high temperature or flu-like symptoms after a tick bite, or if you can’t remove all of the tick. Call 111 for urgent advice, or 999 in an emergency. For pets, contact your vet.
        </p>
      </section>
      <section aria-labelledby="tips-sources" className="text-sm">
        <h3 id="tips-sources" className="mb-2 font-semibold">Sources</h3>
        <ul className="space-y-1.5">
          {SOURCES.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary underline underline-offset-2">
                {s.label}<ExternalLink className="size-3.5" aria-hidden /><span className="sr-only"> (opens in a new tab)</span>
              </a>
              <span className="text-muted-foreground"> · {s.supports}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
