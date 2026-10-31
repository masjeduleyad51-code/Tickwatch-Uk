import { useState } from "react";
import { Check, Navigation, Plus, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildHash } from "@/lib/route";
import type { Coordinates } from "@/types/sighting";

export function directionsUrl(c: Coordinates): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`;
}

export function shareUrl(city: string, loc: Pick<Location, "origin" | "pathname"> = window.location): string {
  return `${loc.origin}${loc.pathname}${buildHash("explore", { city })}`;
}

export function QuickActions({ city, coordinates }: { city: string; coordinates: Coordinates | null }) {
  const [status, setStatus] = useState("");

  async function share() {
    const url = shareUrl(city);
    const data = { title: `Tick sightings in ${city} · TickWatch UK`, url };
    try {
      if (typeof navigator.share === "function") {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(url);
      setStatus("Link copied to clipboard.");
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return; // user closed the share sheet
      setStatus("Couldn’t share automatically. Copy the address from your browser bar instead.");
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
        <Button asChild>
          <a href={buildHash("report", { city })}><Plus aria-hidden /> Report a sighting</a>
        </Button>
        {coordinates ? (
          <Button variant="outline" asChild>
            <a href={directionsUrl(coordinates)} target="_blank" rel="noopener noreferrer">
              <Navigation aria-hidden /> Get directions<span className="sr-only"> to {city} city centre (opens Google Maps in a new tab)</span>
            </a>
          </Button>
        ) : null}
        <Button variant="outline" onClick={share}>
          {status.startsWith("Link") ? <Check aria-hidden /> : <Share2 aria-hidden />} Share
        </Button>
      </div>
      <p role="status" className="mt-2 min-h-5 text-xs text-muted-foreground">{status}</p>
    </div>
  );
}
