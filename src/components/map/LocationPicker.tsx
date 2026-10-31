import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import type L from "leaflet";
import "leaflet/dist/leaflet.css";
import { UK_BOUNDS, UK_MAP_CENTER } from "@/data/ukCities";
import { reportMarkerIcon } from "./markerIcon";

const BOUNDS: L.LatLngBoundsExpression = [
  [UK_BOUNDS.south, UK_BOUNDS.west],
  [UK_BOUNDS.north, UK_BOUNDS.east],
];

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      if (lat >= UK_BOUNDS.south && lat <= UK_BOUNDS.north && lng >= UK_BOUNDS.west && lng <= UK_BOUNDS.east) {
        onPick(Number(lat.toFixed(5)), Number(lng.toFixed(5)));
      }
    },
  });
  return null;
}

/** Optional precise pin. The city select stays the accessible, required way to give a location. */
export function LocationPicker({ value, onPick }: { value: { lat: number; lng: number } | null; onPick: (lat: number, lng: number) => void }) {
  return (
    <MapContainer bounds={BOUNDS} center={[UK_MAP_CENTER.lat, UK_MAP_CENTER.lng]} minZoom={5} className="h-64 w-full rounded-lg">
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <ClickHandler onPick={onPick} />
      {value ? <Marker position={[value.lat, value.lng]} icon={reportMarkerIcon()} keyboard={false} /> : null}
    </MapContainer>
  );
}
