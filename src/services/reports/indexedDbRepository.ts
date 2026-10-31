import type { NewReport, ReportRepository, StoredReport } from "@/types/report";

const DB_NAME = "tickwatch-uk";
const STORE = "reports";

interface Row extends Omit<StoredReport, "photo"> {
  photo: { name: string; type: string; size: number; blob: Blob } | null;
}

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "id" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("Could not open the local database."));
  });
}

/**
 * Prototype database: reports live in this browser's IndexedDB (photos stored as Blobs).
 * `add` resolves on the transaction's `complete` event, i.e. only once the write is durable.
 * Using the report id as the key makes a repeated submit overwrite itself instead of duplicating.
 */
export function createIndexedDbRepository(): ReportRepository {
  return {
    kind: "local",
    async list() {
      const db = await open();
      try {
        const rows = await new Promise<Row[]>((resolve, reject) => {
          const req = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
          req.onsuccess = () => resolve(req.result as Row[]);
          req.onerror = () => reject(req.error ?? new Error("Could not read saved reports."));
        });
        return rows
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .map(({ photo, ...rest }) => ({
            ...rest,
            photo: photo ? { name: photo.name, type: photo.type, size: photo.size, url: URL.createObjectURL(photo.blob) } : null,
          }));
      } finally {
        db.close();
      }
    },
    async add(report: NewReport) {
      const { photo, ...rest } = report;
      const row: Row = {
        ...rest,
        createdAt: new Date().toISOString(),
        photo: photo ? { name: photo.name, type: photo.type, size: photo.size, blob: photo } : null,
      };
      const db = await open();
      try {
        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction(STORE, "readwrite");
          tx.objectStore(STORE).put(row);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error ?? new Error("Could not save the report."));
          tx.onabort = () => reject(tx.error ?? new Error("The report could not be saved (storage may be full)."));
        });
      } finally {
        db.close();
      }
      return {
        ...rest,
        createdAt: row.createdAt,
        photo: photo ? { name: photo.name, type: photo.type, size: photo.size, url: URL.createObjectURL(photo) } : null,
      };
    },
  };
}
