import { Clock, RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ApiError, ApiErrorKind } from "@/services/api/errors";

const COPY: Record<ApiErrorKind, { title: string; hint: string }> = {
  rate_limit: {
    title: "Too many requests",
    hint: "The Elanco API is rate limited. Wait about a minute, then try again.",
  },
  network: {
    title: "Couldn't reach the Elanco API",
    hint: "Check your connection. If the browser console mentions CORS, see Troubleshooting in the README.",
  },
  timeout: {
    title: "The request took too long",
    hint: "The API didn't respond in time. Try again in a moment.",
  },
  server: {
    title: "The Elanco API reported an error",
    hint: "This is a problem on the server side. Try again shortly.",
  },
  not_found: {
    title: "Data not found",
    hint: "The API couldn't find what was requested.",
  },
  client: {
    title: "The request was rejected",
    hint: "The API refused the request. Check the API base URL in your environment settings.",
  },
  invalid_response: {
    title: "Unexpected data from the API",
    hint: "The response wasn't in the format this app expects.",
  },
  unknown: {
    title: "Something went wrong",
    hint: "An unexpected error occurred.",
  },
};

export function ErrorState({ error, onRetry }: { error: ApiError; onRetry: () => void }) {
  const copy = COPY[error.kind];
  const Icon = error.kind === "rate_limit" ? Clock : TriangleAlert;

  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-4 rounded-xl border border-destructive/40 bg-destructive/10 p-5 sm:flex-row sm:items-center"
    >
      <Icon className="size-6 shrink-0 text-destructive" aria-hidden />
      <div className="flex-1 space-y-1">
        <h2 className="font-semibold">{copy.title}</h2>
        <p className="text-sm text-muted-foreground">{copy.hint}</p>
        <p className="text-xs text-muted-foreground">
          {error.status ? `HTTP ${error.status} · ` : ""}
          {error.message}
        </p>
      </div>
      <Button variant="outline" onClick={onRetry}>
        <RefreshCw aria-hidden />
        Try again
      </Button>
    </div>
  );
}
