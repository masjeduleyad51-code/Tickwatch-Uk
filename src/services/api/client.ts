import { env } from "@/config/env";
import { ApiError } from "./errors";

export interface RequestOptions {
  /** Caller cancellation. An aborted request rejects with the original AbortError, not an ApiError. */
  signal?: AbortSignal;
  timeoutMs?: number;
  baseUrl?: string;
  /** Injectable for tests. */
  fetchImpl?: typeof fetch;
}

async function readErrorDetail(response: Response): Promise<string | undefined> {
  try {
    const body: unknown = await response.json();
    if (body && typeof body === "object" && "error" in body) {
      const detail = (body as { error: unknown }).error;
      if (typeof detail === "string" && detail !== "") return detail;
    }
  } catch {
    // Body was empty or not JSON - fall through to the generic message.
  }
  return undefined;
}

async function toHttpError(response: Response): Promise<ApiError> {
  const status = response.status;
  const detail = await readErrorDetail(response);
  if (status === 429) {
    return new ApiError("rate_limit", detail ?? "Rate limit exceeded.", { status });
  }
  if (status === 404) {
    return new ApiError("not_found", detail ?? "Not found.", { status });
  }
  if (status >= 500) {
    return new ApiError("server", detail ?? "The server reported an error.", { status });
  }
  return new ApiError("client", detail ?? `Request failed with status ${status}.`, { status });
}

/**
 * GET `path` (must start with "/") and run the JSON body through `parse`.
 * `parse` should throw if the body is not what we expect; that becomes an
 * ApiError("invalid_response"). Keeping the validator injected keeps this
 * file free of any schema-library dependency.
 */
export async function getJson<T>(
  path: string,
  parse: (data: unknown) => T,
  options: RequestOptions = {},
): Promise<T> {
  const baseUrl = (options.baseUrl ?? env.apiBaseUrl).replace(/\/+$/, "");
  const timeoutMs = options.timeoutMs ?? env.requestTimeoutMs;
  const doFetch: typeof fetch = options.fetchImpl ?? ((input, init) => fetch(input, init));

  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  const onCallerAbort = () => controller.abort();
  if (options.signal) {
    if (options.signal.aborted) controller.abort();
    else options.signal.addEventListener("abort", onCallerAbort, { once: true });
  }

  try {
    let response: Response;
    try {
      response = await doFetch(`${baseUrl}${path}`, {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
    } catch (cause) {
      if (timedOut) {
        throw new ApiError("timeout", `The request timed out after ${timeoutMs} ms.`, { cause });
      }
      if (options.signal?.aborted) throw cause;
      throw new ApiError("network", "Could not reach the API.", { cause });
    }

    if (!response.ok) throw await toHttpError(response);

    let body: unknown;
    try {
      body = await response.json();
    } catch (cause) {
      throw new ApiError("invalid_response", "The API response was not valid JSON.", {
        status: response.status,
        cause,
      });
    }

    try {
      return parse(body);
    } catch (cause) {
      throw new ApiError("invalid_response", "The API response was not in the expected format.", {
        status: response.status,
        cause,
      });
    }
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener("abort", onCallerAbort);
  }
}
