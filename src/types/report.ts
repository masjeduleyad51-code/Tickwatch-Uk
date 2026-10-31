export interface PhotoMeta {
  name: string;
  type: string;
  size: number;
}

/** What the form hands to a repository. */
export interface NewReport {
  /** Client-generated id, also used as an idempotency key against double submits. */
  id: string;
  /** "2024-08-01T14:30:00" - same timezone-less shape as the Elanco API. */
  occurredAt: string;
  city: string;
  species: string;
  latinName: string;
  lat: number;
  lng: number;
  /** true when lat/lng is the city centre rather than a point the user chose. */
  approximateLocation: boolean;
  description: string;
  photo: File | null;
}

export interface StoredReport extends Omit<NewReport, "photo"> {
  createdAt: string;
  photo: (PhotoMeta & { url: string }) | null;
}

export interface ReportRepository {
  readonly kind: "local" | "supabase";
  list(): Promise<StoredReport[]>;
  /** Resolves only after the store has CONFIRMED the write. Rejects otherwise. */
  add(report: NewReport): Promise<StoredReport>;
}
