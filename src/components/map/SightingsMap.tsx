import { useEffect, useMemo } from "react";
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from "react-leaflet";
import type L from "leaflet";
import "leaflet/dist/leaflet.css";
import { UK_BOUNDS, UK_MAP_CENTER } from "@/data/ukCities";
import { SEVERITY_LABEL, type CityStat } from "@/lib/filters";
import { formatNumber } from "@/lib/format";
import type { StoredReport } from "@/types/report";
import { cityMarkerIcon, reportMarkerIcon } from "./markerIcon";

const BOUNDS: L.LatLngBoundsExpression = [
  [UK_BOUNDS.south, UK_BOUNDS.west],
  [UK_BOUNDS.north, UK_BOUNDS.east],
];

function label(marker: L.Marker, text: string) {
  marker.getElement()?.setAttribute("aria-label", text);
}

function ViewController({ cities, selected }: { cities: CityStat[]; selected: string | null }) {
  const map = useMap();
  useEffect(() => {
    const city = cities.find((c) => c.city === selected);
    if (city?.coordinates) {
      map.flyTo([city.coordinates.lat, city.coordinates.lng], Math.max(map.getZoom(), 7), { duration: 0.6 });
    }
  }, [map, cities, selected]);
  return null;
}

interface Props {
  cities: CityStat[];
  reports: StoredReport[];
  selectedCity: string | null;
  onSelectCity: (city: string) => void;
}

export function SightingsMap({ cities, reports, selectedCity, onSelectCity }: Props) {
  const reportIcon = useMemo(() => reportMarkerIcon(), []);
  return (
    <MapContainer
      bounds={BOUNDS}
      center={[UK_MAP_CENTER.lat, UK_MAP_CENTER.lng]}
      minZoom={5}
      maxBounds={[[UK_BOUNDS.south - 3, UK_BOUNDS.west - 6], [UK_BOUNDS.north + 3, UK_BOUNDS.east + 6]]}
      className="size-full min-h-[22rem] rounded-xl"
    >
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <ViewController cities={cities} selected={selectedCity} />
      {cities.map((c) =>
        c.coordinates ? (
          <Marker
            key={c.city}
            position={[c.coordinates.lat, c.coordinates.lng]}
            icon={cityMarkerIcon({ severity: c.severity, recent: c.recentCount > 0, selected: c.city === selectedCity })}
            zIndexOffset={c.city === selectedCity ? 1000 : 0}
            eventHandlers={{
              click: () => onSelectCity(c.city),
              // Leaflet ignores `alt` on divIcon markers, so give the focusable element its accessible name directly.
              add: (e) => label(e.target as L.Marker, `${c.city}: ${c.count} sightings, ${SEVERITY_LABEL[c.severity]} severity${c.recentCount > 0 ? ", recent activity" : ""}. Press Enter for details.`),
            }}
          >
            <Tooltip className="tw-tooltip" direction="top" offset={[0, -16]}>
              <strong>{c.city}</strong>
              <br />
              {formatNumber(c.count)} sightings · {SEVERITY_LABEL[c.severity]}
              <br />
              Most reported: {c.topSpecies}
            </Tooltip>
          </Marker>
        ) : null,
      )}
      {reports.map((r) => (
        <Marker key={r.id} position={[r.lat, r.lng]} icon={reportIcon} eventHandlers={{ click: () => onSelectCity(r.city), add: (e) => label(e.target as L.Marker, `Community report in ${r.city}. Press Enter for details.`) }}>
          <Tooltip className="tw-tooltip" direction="top" offset={[0, -12]}>
            Community report · {r.species === "unknown" ? "species unknown" : r.species}
            {r.approximateLocation ? <><br />Approximate (city centre)</> : null}
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}
