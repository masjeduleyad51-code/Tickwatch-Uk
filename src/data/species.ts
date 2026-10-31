/**
 * Species reference content. The five species are exactly those the Elanco API returns.
 * Descriptions are GENERAL educational notes inferred from each species' common name and
 * genus; they are not derived from the sighting data and are not a substitute for expert
 * identification. See src/data/sources.ts for the references.
 */
export interface SpeciesInfo {
  name: string;
  latinName: string;
  genus: string;
  summary: string;
  likelyHosts: string;
  whereToLook: string;
}

export const SPECIES_GUIDE: readonly SpeciesInfo[] = [
  {
    name: "Passerine tick",
    latinName: "Dermacentor frontalis",
    genus: "Dermacentor",
    summary: "Named for passerines (perching songbirds). Dermacentor is a different genus from the Ixodes ticks below.",
    likelyHosts: "Birds, according to its common name.",
    whereToLook: "Check pets and people after time in places where songbirds nest or feed, such as hedgerows and gardens.",
  },
  {
    name: "Fox/badger tick",
    latinName: "Ixodes canisuga",
    genus: "Ixodes",
    summary: "An Ixodes tick associated with dogs and wild carnivores such as foxes and badgers.",
    likelyHosts: "Dogs, foxes and badgers.",
    whereToLook: "Dog coats (ears, neck, between toes) and bedding or kennels shared with, or visited by, wildlife.",
  },
  {
    name: "Southern rodent tick",
    latinName: "Ixodes acuminatus",
    genus: "Ixodes",
    summary: "An Ixodes tick that feeds mainly on small mammals.",
    likelyHosts: "Rodents and other small mammals.",
    whereToLook: "Rough grass, scrub and woodland edges where small mammals live.",
  },
  {
    name: "Marsh tick",
    latinName: "Ixodes apronophorus",
    genus: "Ixodes",
    summary: "An Ixodes tick linked by its name to wet, marshy habitats.",
    likelyHosts: "Small mammals living in wetland habitats.",
    whereToLook: "Reedbeds, riverbanks and damp meadows.",
  },
  {
    name: "Tree-hole tick",
    latinName: "Ixodes arboricola",
    genus: "Ixodes",
    summary: "Lives in tree holes and nest boxes, where it feeds on the birds that use them.",
    likelyHosts: "Hole-nesting birds.",
    whereToLook: "Mainly around old trees and nest boxes; less likely on people and pets.",
  },
];

export const SPECIES_NAMES: readonly string[] = SPECIES_GUIDE.map((s) => s.name);

export function getSpecies(name: string): SpeciesInfo | undefined {
  return SPECIES_GUIDE.find((s) => s.name === name);
}
