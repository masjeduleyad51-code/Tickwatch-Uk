export interface Source {
  label: string;
  url: string;
  supports: string;
}

/** Only pages whose content was checked while building this app. */
export const SOURCES: readonly Source[] = [
  {
    label: "NHS: Lyme disease",
    url: "https://www.nhs.uk/conditions/lyme-disease/",
    supports: "Symptoms, rash timing, removal with fine-tipped tweezers, prevention and when to see a GP.",
  },
  {
    label: "UKHSA: stay tick aware this summer",
    url: "https://www.gov.uk/government/news/ukhsa-reminds-public-to-stay-tick-aware-this-summer",
    supports: "Seek treatment promptly if symptoms develop after a tick bite.",
  },
];
