import L from "leaflet";
import type { Severity } from "@/lib/filters";

const GLYPH: Record<Severity, string> = { low: "L", medium: "M", high: "H" };

export interface MarkerState {
  severity: Severity;
  recent: boolean;
  selected: boolean;
}

/**
 * Severity is encoded three ways so it never depends on colour alone:
 * colour + shape (circle / diamond / pin) + a letter. A pulsing ring marks recent activity.
 */
export function cityMarkerIcon({ severity, recent, selected }: MarkerState): L.DivIcon {
  const classes = ["tw-marker", `tw-marker--${severity}`, selected ? "tw-marker--selected" : ""].filter(Boolean).join(" ");
  return L.divIcon({
    className: "",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    html: `<div class="${classes}" style="--tw-color:var(--severity-${severity === "medium" ? "med" : severity})">${
      recent ? '<span class="tw-marker__pulse"></span>' : ""
    }<span class="tw-marker__body"><span class="tw-marker__glyph" aria-hidden="true">${GLYPH[severity]}</span></span></div>`,
  });
}

export function reportMarkerIcon(): L.DivIcon {
  return L.divIcon({
    className: "",
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    html: '<div class="tw-marker tw-marker--report"><span class="tw-marker__body"><span class="tw-marker__glyph" aria-hidden="true">R</span></span></div>',
  });
}
