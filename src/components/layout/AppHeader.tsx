import { Bug } from "lucide-react";
import { buildHash, type RouteName } from "@/lib/route";
import { cn } from "@/lib/utils";

const LINKS: ReadonlyArray<{ name: RouteName; label: string }> = [
  { name: "explore", label: "Explore" },
  { name: "report", label: "Report a sighting" },
  { name: "learn", label: "Learn" },
];

export function AppHeader({ current }: { current: RouteName }) {
  return (
    <header className="sticky top-0 z-[1100] border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <a href={buildHash("explore")} className="flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Bug className="size-5" aria-hidden />
          </span>
          <span className="text-lg font-semibold leading-tight">TickWatch UK</span>
        </a>
        <nav aria-label="Main">
          <ul className="flex items-center gap-1">
            {LINKS.map((l) => (
              <li key={l.name}>
                <a
                  href={buildHash(l.name)}
                  aria-current={l.name === current ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-10 items-center rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    l.name === current ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
