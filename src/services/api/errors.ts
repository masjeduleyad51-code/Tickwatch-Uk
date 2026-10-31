export type ApiErrorKind =
  | "network" // fetch failed (offline, DNS, CORS...)
  | "timeout"
  | "rate_limit" // HTTP 429
  | "not_found" // HTTP 404
  | "server" // HTTP 5xx
  | "client" // other 4xx
  | "invalid_response" // 2xx but body was not JSON / not the expected shape
  | "unknown";

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | undefined;

  constructor(
    kind: ApiErrorKind,
    message: string,
    options: { status?: number; cause?: unknown } = {},
  ) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause });
    this.name = "ApiError";
    this.kind = kind;
    this.status = options.status;
  }
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}

/** Normalise anything thrown into an ApiError so the UI has one shape to handle. */
export function toApiError(value: unknown): ApiError {
  if (isApiError(value)) return value;
  const message = value instanceof Error ? value.message : "Something went wrong.";
  return new ApiError("unknown", message, { cause: value });
}
