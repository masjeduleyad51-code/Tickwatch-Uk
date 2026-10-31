import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Learn from "./Learn";
import { SeasonalChart } from "@/components/charts/SeasonalChart";
import type { SightingsState } from "@/hooks/useSightings";
import { realSightings } from "@/test/realData";

const success: SightingsState = { status: "success", data: { sightings: realSightings, skippedRecords: 0, unmappedCities: [] } };

describe("Learn", () => {
  it("lists all five species with real counts from the data", () => {
    render(<Learn state={success} onRetry={() => {}} />);
    expect(screen.getAllByRole("heading", { level: 3 }).filter((h) => /tick$/.test(h.textContent ?? ""))).toHaveLength(5);
    expect(screen.getByText("226 sightings")).toBeInTheDocument(); // Passerine tick
  });

  it("tabs follow the WAI-ARIA keyboard pattern and expose sources on prevention", async () => {
    const user = userEvent.setup();
    render(<Learn state={success} onRetry={() => {}} />);
    const tabs = screen.getAllByRole("tab");
    tabs[0]!.focus();
    await user.keyboard("{ArrowRight}");
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    expect(tabs[1]).toHaveFocus();
    expect(screen.getByRole("heading", { name: /if you find a tick/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /nhs: lyme disease/i })).toHaveAttribute("href", "https://www.nhs.uk/conditions/lyme-disease/");
    await user.keyboard("{End}");
    expect(tabs[2]).toHaveAttribute("aria-selected", "true");
  });

  it("opens the requested tab from the URL", () => {
    render(<Learn state={success} onRetry={() => {}} initialTab="seasonal" />);
    expect(screen.getByLabelText("City")).toBeInTheDocument();
  });

  it("still shows species and prevention when the API failed, but flags the chart", async () => {
    const user = userEvent.setup();
    render(<Learn state={{ status: "error", error: { name: "ApiError", message: "x", kind: "network" } as never }} onRetry={() => {}} />);
    expect(screen.getByText("Marsh tick")).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: /seasonal/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(/couldn.t reach/i);
  });
});

describe("SeasonalChart", () => {
  it("city + year selectors change the data, and the table matches the count", async () => {
    const user = userEvent.setup();
    render(<SeasonalChart sightings={realSightings} />);
    expect(screen.getByRole("status")).toHaveTextContent("1000 sightings");
    await user.selectOptions(screen.getByLabelText("City"), "London");
    expect(screen.getByRole("status")).toHaveTextContent("76 sightings");
    await user.selectOptions(screen.getByLabelText("Year"), "2020");
    const expected = realSightings.filter((s) => s.city === "London" && s.year === 2020).length;
    expect(screen.getByRole("status")).toHaveTextContent(new RegExp(`^${expected} sightings?\\.`));
    const table = screen.getByRole("table", { hidden: true });
    const total = within(table).getAllByRole("row").slice(1).reduce((n, r) => n + Number(within(r).getAllByRole("cell")[0]?.textContent), 0);
    expect(total).toBe(expected);
  });

  it("shows an honest empty state, not an empty chart, when there is no data", async () => {
    const user = userEvent.setup();
    const subset = realSightings.filter((s) => s.city !== "Leeds" || s.year === 2019);
    render(<SeasonalChart sightings={subset} initialCity="Leeds" initialYear={2019} />);
    await user.selectOptions(screen.getByLabelText("Year"), "2012");
    expect(screen.getByText("No sightings for this selection")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
