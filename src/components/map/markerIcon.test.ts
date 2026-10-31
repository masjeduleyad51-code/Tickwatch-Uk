import { cityMarkerIcon } from "./markerIcon";
import { directionsUrl, shareUrl } from "@/components/sightings/QuickActions";

const html = (o: Parameters<typeof cityMarkerIcon>[0]) => String(cityMarkerIcon(o).options.html);

describe("marker icons", () => {
  it("encode severity by shape class and letter, not just colour", () => {
    expect(html({ severity: "low", recent: false, selected: false })).toMatch(/tw-marker--low[\s\S]*>L</);
    expect(html({ severity: "medium", recent: false, selected: false })).toMatch(/tw-marker--medium[\s\S]*>M</);
    expect(html({ severity: "high", recent: false, selected: false })).toMatch(/tw-marker--high[\s\S]*>H</);
  });
  it("adds a pulse ring only for recent activity and an outline only when selected", () => {
    expect(html({ severity: "low", recent: true, selected: false })).toContain("tw-marker__pulse");
    expect(html({ severity: "low", recent: false, selected: false })).not.toContain("tw-marker__pulse");
    expect(html({ severity: "low", recent: false, selected: true })).toContain("tw-marker--selected");
  });
});

describe("quick action URLs", () => {
  it("builds a Google Maps directions link and a deep link for sharing", () => {
    expect(directionsUrl({ lat: 51.5, lng: -0.1 })).toBe("https://www.google.com/maps/dir/?api=1&destination=51.5,-0.1");
    expect(shareUrl("Leeds", { origin: "https://x.test", pathname: "/app/" })).toBe("https://x.test/app/#/explore?city=Leeds");
  });
});
