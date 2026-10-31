import { env } from "@/config/env";
import type { ReportRepository } from "@/types/report";
import { createIndexedDbRepository } from "./indexedDbRepository";
import { createSupabaseRepository } from "./supabaseRepository";

/** Supabase when both public env vars are set, otherwise the in-browser IndexedDB prototype. */
export function createReportRepository(): ReportRepository {
  if (env.supabaseUrl && env.supabaseAnonKey) {
    return createSupabaseRepository({ url: env.supabaseUrl, anonKey: env.supabaseAnonKey });
  }
  return createIndexedDbRepository();
}
