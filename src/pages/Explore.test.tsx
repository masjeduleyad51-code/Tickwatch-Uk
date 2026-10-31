import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Explore from "./Explore";
import type { SightingsState } from "@/hooks/useSightings";
import type { CityStat } from "@/lib/filters";
import { resetReportsStore } from "@/services/reports/store";
import { realSightings } from "@/test/realData";

// Leaflet needs real layout; replace the map with a faithful stand-in that exposes what it was given.
vi.mock("@/components/map/SightingsMap", () => ({
  SightingsMap: ({ cities, onSelectCity }: { cities: CityStat[]; onSelectCity: (c: string) => void }) => (
    <ul data-testid="map">
      {cities.map((c) => (
        <li key={c.city}>
          <button data-count={c.count} data-severity={c.severity} onClick={() => onSelectCity(c.city)}>marker {c.city}</button>
        </li>
      ))}
    </ul>
  ),
}));

const success: SightingsState = { status: "success", data: { sightings: realSightings, skippedRecords: 0, unmappedCities: [] } };
const markers = () => within(screen.getByTestId("map")).queryAllByRole("button");
const mapTotal = () => markers().reduce((n, b) => n + Number(b.getAttribute("data-count")), 0);

beforeEach(() => resetReportsStore({ kind: "local", list: async () => [], add: async () => { throw new Error("unused"); } }));

describe("Explore", () => {
  it("loads all real sightings: results list, summary and map agree", () => {
    render(<Explore state={success} onRetry={() => {}} />);
    expect(screen.getByText(/1,000 sightings in 14 cities/)).toBeInTheDocument();
    expect(markers()).toHaveLength(14);
    expect(mapTotal()).toBe(1000);
  });

  it("species filter updates BOTH the map and the results list", async () => {
    const user = userEvent.setup();
    render(<Explore state={success} onRetry={() => {}} />);
    await user.selectOptions(screen.getByLabelText("Species"), "Marsh tick");
    expect(screen.getByText(/186 sightings in/)).toBeInTheDocument();
    expect(mapTotal()).toBe(186);
    expect(screen.getByText(/1 active/)).toBeInTheDocument();
  });

  it("severity filter leaves only markers of that severity", async () => {
    const user = userEvent.setup();
    render(<Explore state={success} onRetry={() => {}} />);
    await user.selectOptions(screen.getByLabelText(/severity/i), "high");
    const shown = markers();
    expect(shown.length).toBeGreaterThan(0);
    expect(shown.length).toBeLessThan(14);
    expect(shown.every((b) => b.getAttribute("data-severity") === "high")).toBe(true);
  });

  it("custom date range works, validates, and shows an honest empty state with a way back", async () => {
    const user = userEvent.setup();
    render(<Explore state={success} onRetry={() => {}} />);
    await user.selectOptions(screen.getByLabelText("Date range"), "custom");
    await user.type(screen.getByLabelText("From"), "2030-01-01");
    await user.type(screen.getByLabelText("To"), "2030-12-31");
    expect(screen.getByText("No matching sightings")).toBeInTheDocument();
    expect(markers()).toHaveLength(0);
    await user.click(screen.getByRole("button", { name: /reset filters/i }));
    expect(markers()).toHaveLength(14);

    await user.selectOptions(screen.getByLabelText("Date range"), "custom");
    await user.type(screen.getByLabelText("From"), "2022-01-01");
    await user.type(screen.getByLabelText("To"), "2021-01-01");
    expect(screen.getAllByRole("alert").some((a) => /start date must be before/i.test(a.textContent ?? ""))).toBe(true);
  });

  it("clicking a marker opens that city's panel with timeline and quick actions", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText");
    render(<Explore state={success} onRetry={() => {}} />);
    await user.click(screen.getByRole("button", { name: "marker Glasgow" }));

    expect(screen.getByRole("heading", { level: 2, name: /glasgow/i })).toBeInTheDocument();
    expect(screen.getByText(/78 sightings in view/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /activity timeline/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /report a sighting/i })).toHaveAttribute("href", "#/report?city=Glasgow");
    expect(screen.getByRole("link", { name: /get directions/i })).toHaveAttribute("href", expect.stringContaining("destination=55.8642,-4.2518"));

    await user.click(screen.getByRole("button", { name: /^share/i }));
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("#/explore?city=Glasgow"));
    expect(await screen.findByText(/link copied/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /all results/i }));
    expect(screen.getByRole("heading", { name: "Results" })).toBeInTheDocument();
  });

  it("selecting a result shows that exact sighting's details", async () => {
    const user = userEvent.setup();
    render(<Explore state={success} onRetry={() => {}} />);
    const first = realSightings[0]!;
    const results = screen.getByRole("heading", { name: "Results" }).closest("section")!;
    await user.click(within(results).getAllByRole("button")[0]!);
    const detail = screen.getByRole("heading", { name: /selected sighting/i }).closest("section")!;
    expect(within(detail).getByText(first.id)).toBeInTheDocument();
    expect(within(detail).getByText(first.latinName)).toBeInTheDocument();
  });

  it("handles loading, error and empty states", () => {
    const { rerender } = render(<Explore state={{ status: "loading" }} onRetry={() => {}} />);
    expect(screen.getByRole("status")).toHaveTextContent(/loading/i);
    rerender(<Explore state={{ status: "error", error: { name: "ApiError", message: "boom", kind: "rate_limit", status: 429 } as never }} onRetry={() => {}} />);
    expect(screen.getByRole("alert")).toHaveTextContent(/too many requests/i);
    rerender(<Explore state={{ status: "empty", data: { sightings: [], skippedRecords: 0, unmappedCities: [] } }} onRetry={() => {}} />);
    expect(screen.getByText(/no sightings to show/i)).toBeInTheDocument();
  });
});
