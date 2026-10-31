import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReportForm } from "./ReportForm";
import { resetReportsStore } from "@/services/reports/store";
import type { NewReport, ReportRepository, StoredReport } from "@/types/report";

vi.mock("@/components/map/LocationPicker", () => ({ LocationPicker: () => <div data-testid="picker" /> }));

function fakeRepo(add: (r: NewReport) => Promise<StoredReport>): ReportRepository & { add: ReturnType<typeof vi.fn> } {
  return { kind: "local", list: vi.fn(async () => []), add: vi.fn(add) };
}
const echo = async (r: NewReport): Promise<StoredReport> => ({
  ...r, createdAt: "2026-10-31T12:00:00Z",
  photo: r.photo ? { name: r.photo.name, type: r.photo.type, size: r.photo.size, url: "blob:x" } : null,
});

beforeAll(() => { URL.createObjectURL = () => "blob:preview"; URL.revokeObjectURL = () => {}; });

async function fillValid(user: ReturnType<typeof userEvent.setup>, species = "Marsh tick") {
  await user.type(screen.getByLabelText(/date seen/i), "2024-08-01");
  await user.type(screen.getByLabelText(/approximate time/i), "14:30");
  await user.selectOptions(screen.getByLabelText(/nearest city/i), "Manchester");
  await user.selectOptions(screen.getByLabelText(/^species/i), species);
}

describe("ReportForm", () => {
  it("shows an error for every missing required field and does not save", async () => {
    const repo = fakeRepo(echo);
    resetReportsStore(repo);
    const user = userEvent.setup();
    render(<ReportForm />);
    await user.click(screen.getByRole("button", { name: /submit report/i }));
    expect(await screen.findByText(/enter the date you saw/i)).toBeInTheDocument();
    expect(screen.getByText(/enter the approximate time/i)).toBeInTheDocument();
    expect(screen.getByText(/choose the nearest city/i)).toBeInTheDocument();
    expect(screen.getByText(/choose a species, or/i)).toBeInTheDocument();
    expect(screen.getByText(/please fix 4 problems/i)).toBeInTheDocument();
    expect(repo.add).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/date seen/i)).toHaveAttribute("aria-invalid", "true");
  });

  it("rejects a date in the future", async () => {
    resetReportsStore(fakeRepo(echo));
    const user = userEvent.setup();
    render(<ReportForm />);
    await user.type(screen.getByLabelText(/date seen/i), "2999-01-01");
    await user.type(screen.getByLabelText(/approximate time/i), "10:00");
    await user.selectOptions(screen.getByLabelText(/nearest city/i), "London");
    await user.selectOptions(screen.getByLabelText(/^species/i), "Marsh tick");
    await user.click(screen.getByRole("button", { name: /submit report/i }));
    expect(await screen.findByText(/can’t be in the future/i)).toBeInTheDocument();
  });

  it("shows non-blocking warnings, and still lets the user submit", async () => {
    const repo = fakeRepo(echo);
    resetReportsStore(repo);
    const user = userEvent.setup();
    render(<ReportForm />);
    await fillValid(user, "unknown");
    expect(screen.getByText(/over a year ago/i)).toBeInTheDocument();
    expect(screen.getByText(/without a species, a photo helps/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /submit report/i }));
    expect(await screen.findByText(/report saved/i)).toBeInTheDocument();
    expect(repo.add).toHaveBeenCalledTimes(1);
  });

  it("rejects a non-image upload with a clear message", async () => {
    resetReportsStore(fakeRepo(echo));
    const user = userEvent.setup({ applyAccept: false });
    render(<ReportForm />);
    await user.upload(screen.getByLabelText(/photo/i), new File(["x"], "notes.pdf", { type: "application/pdf" }));
    expect(await screen.findByText(/upload a jpeg, png or webp/i)).toBeInTheDocument();
  });

  it("saves with the right payload and only then shows success (photo included)", async () => {
    const repo = fakeRepo(echo);
    resetReportsStore(repo);
    const user = userEvent.setup();
    render(<ReportForm />);
    await fillValid(user);
    await user.upload(screen.getByLabelText(/photo/i), new File([new Uint8Array(10)], "tick.jpg", { type: "image/jpeg" }));
    expect(screen.getByAltText(/preview of tick\.jpg/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /submit report/i }));

    expect(await screen.findByRole("heading", { name: /report saved/i })).toBeInTheDocument();
    const sent = repo.add.mock.calls[0]?.[0] as NewReport;
    expect(sent).toMatchObject({
      occurredAt: "2024-08-01T14:30:00", city: "Manchester", species: "Marsh tick",
      latinName: "Ixodes apronophorus", approximateLocation: true, lat: 53.4808, lng: -2.2426,
    });
    expect(sent.photo?.name).toBe("tick.jpg");
    expect(screen.getByRole("link", { name: /see it on the map/i })).toHaveAttribute("href", "#/explore?city=Manchester");
  });

  it("on a save failure: never claims success, explains, and a retry reuses the same id", async () => {
    let calls = 0;
    const repo = fakeRepo(async (r) => { if (++calls === 1) throw new Error("Saving the report failed (HTTP 503)."); return echo(r); });
    resetReportsStore(repo);
    const user = userEvent.setup();
    render(<ReportForm />);
    await fillValid(user);
    await user.click(screen.getByRole("button", { name: /submit report/i }));

    expect(await screen.findByText(/your report was not saved/i)).toBeInTheDocument();
    expect(screen.getByText(/HTTP 503/)).toBeInTheDocument();
    expect(screen.queryByText(/report saved/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /submit report/i }));
    expect(await screen.findByRole("heading", { name: /report saved/i })).toBeInTheDocument();
    const ids = repo.add.mock.calls.map((c) => (c[0] as NewReport).id);
    expect(ids).toHaveLength(2);
    expect(ids[0]).toBe(ids[1]);
  });

  it("ignores a second click while the first save is still in flight", async () => {
    let release: () => void = () => {};
    const repo = fakeRepo((r) => new Promise((res) => { release = () => res(echo(r)); }));
    resetReportsStore(repo);
    const user = userEvent.setup();
    render(<ReportForm />);
    await fillValid(user);
    const submit = screen.getByRole("button", { name: /submit report/i });
    await user.click(submit);
    await waitFor(() => expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled());
    await user.click(screen.getByRole("button", { name: /saving/i }));
    release();
    expect(await screen.findByRole("heading", { name: /report saved/i })).toBeInTheDocument();
    expect(repo.add).toHaveBeenCalledTimes(1);
  });
});
