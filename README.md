# TickWatch UK

An interactive web app for exploring reported tick sightings across the UK and reporting new ones, built for the
**Elanco Placement Programme – Frontend technical task**.

**Submitted by:** [YOUR NAME] · **Repo:** [GitHub URL] · **Walkthrough video:** [unlisted YouTube URL]

![stack](https://img.shields.io/badge/React-19-61dafb) ![ts](https://img.shields.io/badge/TypeScript-strict-3178c6) ![tests](https://img.shields.io/badge/tests-107%20passing-35d0ba)

## Run it

Requires Node.js 20+.

```bash
npm install
npm run dev        # http://localhost:5173
```

No API key or database is needed: the Elanco API is public and reports are saved in your browser by default.

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Strict type-check, then production build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm test` | Run all 107 tests once (`npm run test:watch` to watch) |
| `npm run typecheck` | Type-check only |

If the browser reports a CORS error, set `VITE_API_BASE_URL=/elanco` in `.env.local` and restart. The dev server then proxies the API.

## What it does

Three screens, all deep-linkable (`#/explore?city=London`, `#/report`, `#/learn?tab=seasonal`).

| Screen | Features |
| --- | --- |
| **Explore** | Leaflet map of all 1,000 sightings aggregated by city; filters (date range incl. custom, species, derived severity, recent only); results list; sidebar with city detail, selected-sighting detail, species mix, **timeline**, **Report / Get Directions / Share** |
| **Report a sighting** | React Hook Form + Zod form: date, time, city, species, optional map pin, notes, **photo upload**; inline errors, non-blocking warnings, save confirmation |
| **Learn** | **Species guide** (5 species from the API), **prevention tips** with sources, **seasonal activity chart** with city and year selectors, chart-as-table alternative |

### Brief requirements → where to find them

| # | Requirement | Status | Evidence |
| --- | --- | --- | --- |
| 1a | Dynamic map of sightings | ✅ | `components/map/SightingsMap.tsx` |
| 1b | Markers: severity, recent activity, species | ✅ | `markerIcon.ts` (colour + shape + letter for severity, pulse ring for recent); dominant species in the tooltip |
| 1c | Filters: date, species, severity | ✅ | `filters/FilterBar.tsx`, `lib/filters.ts`, `lib/filters.test.ts` |
| 2a | Detail panel on marker click | ✅ | `sightings/CityDetailPanel.tsx` |
| 2b | Timeline of activity in an area | ✅ | `sightings/ActivityTimeline.tsx` (yearly series + latest events) |
| 2c | Report / Directions / Share | ✅ | `sightings/QuickActions.tsx` |
| 3a | Species identification guide | ✅ | `learn/SpeciesGuide.tsx`, `data/species.ts` |
| 3b | Prevention tips | ✅ | `learn/PreventionTips.tsx`, `data/sources.ts` |
| 3c | Seasonal chart with city + year selects | ✅ | `charts/SeasonalChart.tsx` |
| 4a | Report form (date, time, location, species) + own database | ✅ | `forms/ReportForm.tsx`, `services/reports/*` |
| 4b | Validation: error, warning, success | ✅ | `schemas/reportSchema.ts`, `lib/reportWarnings.ts` |
| 4c | Image upload | ✅ | `forms/PhotoField.tsx` (JPEG/PNG/WebP, ≤ 5 MB, preview) |
| + | Wireframes | ✅ | `docs/WIREFRAMES.md` |
| + | Accessibility | ✅ | see [Accessibility](#accessibility) |

## Decisions worth discussing

**The API is thinner than the brief assumes, so the app is honest about it.** A sighting has only `id, date, location (city), species, latinName`.

1. **No coordinates →** `data/ukCities.ts` is *our own* lookup of approximate city-centre points for the 14 cities in the data. Markers are therefore one per city, not one per sighting. I chose this over inventing jittered coordinates for real records. A test fails if the API ever returns a city we don't have.
2. **No severity field →** severity is **derived and labelled as derived**: cities are ranked by sighting count in the current view and split into thirds (High / Medium / Low). It is relative, so it changes with the filters. See `assignSeverity`.
3. **Data ends in December 2024 →** "Last 30 days" and "Recent" count back from the newest sighting, not today, otherwise they'd always be empty. The UI says so.
4. **Dates have no timezone →** read as UTC wall-clock time and always formatted in UTC so month grouping never shifts per viewer.
5. **Rate limiting (HTTP 429) and no server filters →** the full list is fetched once per session (in-flight promise cached), and all filtering and grouping is client-side. Failed requests aren't cached, so "Try again" really retries.
6. **The data is sparse per city-year** (~5–7 sightings), so the seasonal chart warns when a sample is small and shows an empty state, not a blank chart, when there's none.

**Reports database.** By default reports go to **IndexedDB in your browser** (photos stored as Blobs). That works out of the box and survives refreshes, but is private to that browser. For a shared database, set the two public Supabase variables below and the same code uses Supabase instead; the choice is one function (`services/reports/index.ts`) behind a `ReportRepository` interface. Success is only shown after the store confirms the write (IndexedDB transaction `complete`, or a Supabase response containing the inserted row). Each attempt has a client-generated id, so a retry after a network failure can't create a duplicate, and the submit button is disabled while saving.

**Other choices.** React + strict TypeScript + Vite; Zod validates the API at the boundary *per record* so one bad row can't blank the app; Tailwind v4 with shadcn-style primitives; native `<select>`s for the best keyboard and mobile behaviour; a ~20-line hash router instead of a router dependency (works on any static host and makes share links trivial); route-level code splitting keeps Leaflet and Recharts off pages that don't need them.

## Supabase setup (optional)

1. Create a project at supabase.com.
2. Run `supabase/migrations/0001_sighting_reports.sql` in the SQL editor. It creates the table with constraints, enables Row Level Security (anonymous insert + select only; no update or delete), and creates a 5 MB images-only `report-photos` bucket.
3. In `.env.local` set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. **Use the public anon key only. Never put a `service_role` key in the frontend.**

> ⚠️ The Supabase adapter follows Supabase's documented REST API and is covered by mocked-`fetch` tests, but **has not been run against a live project**. Verify it once before relying on it.

## Accessibility

Skip link; landmarks; a page-level `h1` and `document.title` per screen, with ordered headings; visible focus rings; WAI-ARIA tabs with arrow/Home/End keys; every form field has a label, hint, and `aria-describedby`-linked error/warning, with `aria-invalid`; errors use `role="alert"`, results and chart summaries use `aria-live`; **severity is never colour-only** (colour + marker shape + letter + text label); map markers are keyboard-focusable with descriptive names; charts have text summaries plus a "view as table" alternative; motion respects `prefers-reduced-motion`; form fields, tabs and nav links are 40 px tall and buttons 32–40 px (the 44 px mobile ideal isn't met everywhere); text contrast ≥ 7.6:1 for body and muted text, 4.8:1 for form-field borders (computed from the token hex values). The optional map-pin picker needs a mouse or touch, but it is optional and city selection is the required, accessible way to give a location.

## Architecture

```
src/
  config/       env parsing + validation
  types/        api.ts (raw DTOs)  sighting.ts / report.ts (domain types)
  services/     api/ (fetch client, Zod schemas, errors)  mappers.ts  sightingsService.ts
                reports/ (ReportRepository: IndexedDB + Supabase, shared store)
  lib/          pure logic: filters, aggregate, route, reportWarnings, format
  schemas/      Zod report-form schema
  data/         ukCities, species, sources (static reference data)
  hooks/        useSightings, useReports, useRoute
  components/   ui/ common/ layout/ map/ filters/ sightings/ forms/ charts/ learn/
  pages/        Explore, ReportSighting, Learn
supabase/migrations/   SQL schema + RLS
docs/                  wireframes, demo script
```

Layering: components → hooks → services; only `services/api` knows about HTTP. All filtering lives in `lib/filters.ts#applyFilters`, which feeds *both* the map and the list, so they cannot disagree (there's a test for that).

## Testing

`npm test` runs 107 tests in 20 files, many against the **saved real API response** (1,000 records, `src/test/fixtures`): filters and severity, aggregation (totals cross-checked with hand-computed numbers), the API client (429/404/500/timeout/network), mappers, form validation (errors and warnings), repositories (IndexedDB persistence across instances; mocked Supabase), the report form (validation, success only after confirmed save, failure + idempotent retry, double-click guard), Explore (filters update map and list, panel, quick actions), Learn (keyboard tabs, selectors, empty state).

**Not covered by automated tests:** real Leaflet rendering (the map is stubbed in jsdom), visual layout, and the live API/Supabase. Manual checks I'd do before a demo are in `docs/DEMO_SCRIPT.md`.

## Known limitations

- Severity is relative and derived; it is not a clinical or epidemiological risk measure.
- Markers are city-level because the API has no coordinates.
- Community reports are stored per browser unless Supabase is configured, and don't affect severity or the seasonal chart (which use the Elanco dataset only).
- Species notes are general and based on common names; this is not identification advice. The sheep tick (*Ixodes ricinus*), the usual UK Lyme vector, is not labelled in the dataset.
- Map tiles come from OpenStreetMap's public server, so they need a network connection and are not for heavy production use.

## What I'd do next

Server-side validation and moderation of reports; real geocoding; marker clustering if per-sighting coordinates become available; a dedicated species-identification photo set from a reputable source; end-to-end browser tests (Playwright) for the map.

## Sources

Health guidance: [NHS – Lyme disease](https://www.nhs.uk/conditions/lyme-disease/); [UKHSA – stay tick aware](https://www.gov.uk/government/news/ukhsa-reminds-public-to-stay-tick-aware-this-summer). Map data © OpenStreetMap contributors.
