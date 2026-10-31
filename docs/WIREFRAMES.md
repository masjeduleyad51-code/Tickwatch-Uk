# Wireframes

Low-fidelity layouts used to plan the three screens (desktop first, then how they collapse on mobile).

## Explore (desktop ≥ 1024px)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ◉ TickWatch UK                      Explore  Report a sighting  Learn    │
├──────────────────────────────────────────────────────────────────────────┤
│ [Sightings in view] [Cities] [Species] [Date range]                       │
│ ┌ Filters ───────────────────────────────────────────────  [Reset] ─────┐ │
│ │ Date range ▾   Species ▾   Severity ▾   (○) Recent only               │ │
│ └───────────────────────────────────────────────────────────────────────┘ │
│ ┌ Map ────────────────────────────────────┐ ┌ Results ─────────────────┐ │
│ │        ● H                              │ │ London    [Recent] [High]│ │
│ │   ◆ M          ● L                      │ │ Marsh tick · Ixodes …    │ │
│ │        ▲ H   (ring = recent)            │ │ 30 Dec 2024              │ │
│ │                                         │ │ …                        │ │
│ └─────────────────────────────────────────┘ │ [Show more]              │ │
│  Legend: L ● · M ◆ · H ▲ · ring · R        └──────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
        click marker / result  ▼  Results panel is replaced by:
                                   ┌ Glasgow ─────────── [← All results] ┐
                                   │ 78 sightings · High · 2 recent      │
                                   │ [Report] [Get directions] [Share]   │
                                   │ Selected sighting (species, id …)   │
                                   │ Species in view ▇▇▇▇ ▇▇▇ ▇▇         │
                                   │ Activity timeline  ▁▃▅▂▆▃▄ + list   │
                                   │ Sightings in Glasgow (list)         │
                                   └─────────────────────────────────────┘
```

Mobile: filters stack, the map takes 60% of the viewport height, and the results/detail panel sits below it.

## Report a sighting

```
┌ Report a sighting ───────────────────────────┐ ┌ Your saved reports ─┐
│ Date seen *      Approximate time *          │ │ London · Marsh tick │
│ [__/__/____]     [__:__]                     │ │ 1 Aug 2024, 14:30   │
│ Nearest city *   Species *                   │ └─────────────────────┘
│ [Choose ▾]       [Choose ▾ / Not sure]       │
│ ┌ Exact spot (optional) ───────────────────┐ │
│ │ [ mini map: click to drop a pin ] [Clear]│ │
│ └──────────────────────────────────────────┘ │
│ Notes (0/500)                                │
│ Photo [Choose file]  [preview] [Remove]      │
│ ⚠ warnings (non-blocking)   ✖ errors inline  │
│ [Submit report]  →  ✔ Report saved           │
└──────────────────────────────────────────────┘
```

## Learn

```
┌ Learn about ticks ───────────────────────────────────────────┐
│ [ Species guide ] [ Prevention tips ] [ Seasonal activity ]  │
│ Species cards ×5 (name, Latin, sightings, hosts, where)      │
│ ── or ──  Before / After / If you find a tick + sources      │
│ ── or ──  City ▾  Year ▾   ▁▂▅▇▅▃▂▁▂▃▄▂  [view as table]     │
└──────────────────────────────────────────────────────────────┘
```
