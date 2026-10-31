import type { SightingDto } from "@/types/api";

export function makeDto(overrides: Partial<SightingDto> = {}): SightingDto {
  return {
    id: "02WNholuSg6ndCk4c1dA",
    date: "2022-08-01T06:40:31",
    location: "Manchester",
    species: "Marsh tick",
    latinName: "Ixodes apronophorus",
    ...overrides,
  };
}

/** n distinct DTOs, one day apart, cycling through a few cities. */
export function makeDtos(n: number): SightingDto[] {
  const cities = ["London", "Glasgow", "Cardiff", "Leeds"];
  return Array.from({ length: n }, (_, i) =>
    makeDto({
      id: `id-${String(i).padStart(4, "0")}`,
      date: `2023-03-${String((i % 27) + 1).padStart(2, "0")}T12:00:00`,
      location: cities[i % cities.length] ?? "London",
    }),
  );
}
