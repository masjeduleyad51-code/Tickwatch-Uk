# Walkthrough video script (target 7–8 minutes; limit is 10)

Record with the app running (`npm run dev`) and the repo open in a second window.

**Before recording (manual checks, ~5 min)**
- [ ] `npm install && npm test && npm run build` all pass on a clean clone.
- [ ] The map loads real tiles and shows 14 markers (the sandbox this was built in had no browser, so check this yourself).
- [ ] Clear site data, submit one report with a photo, **refresh**, and confirm it's still there.
- [ ] Resize to phone width and tab through the page with the keyboard only.

| Time | Show | Say |
| --- | --- | --- |
| 0:00 | Title, your name | Who you are, what TickWatch UK is, the 4 brief areas. |
| 0:30 | Explore, full page | Real data from Elanco's API: 1,000 sightings, 14 cities. The API has no coordinates and no severity, so markers are per city and severity is derived and labelled. |
| 1:30 | Map + legend | Severity is colour + shape + letter, not colour alone. Pulse ring = recent activity. Hover tooltip shows dominant species. |
| 2:15 | Filters | Species, severity, date range (custom too), recent only. Map and list update together. Mention "last 30 days" is anchored to the dataset's end (Dec 2024). Show the empty state and Reset. |
| 3:15 | Click a marker | Sidebar: counts, species mix, **timeline**, selected sighting. **Report / Get directions / Share**. |
| 4:15 | Report form | Submit empty → errors. Future date → error. "Not sure" species → warning. Upload a PDF → rejected; upload a photo → preview. Submit → success only after the save is confirmed. Refresh → still there; see it on the map as a community report. |
| 5:45 | Learn | Species guide, prevention tips with sources, seasonal chart: change city and year, table view, an empty selection. |
| 6:30 | Accessibility | Tab through the nav, filters and tabs; skip link; screen-reader names on markers. |
| 7:00 | Code | Folder structure, `lib/filters.ts` (one source of truth for map + list), repository interface (IndexedDB ↔ Supabase), run `npm test`. |
| 7:45 | Limits + next steps | City-level markers, derived severity, per-browser reports unless Supabase is set up, what you'd add next. |
