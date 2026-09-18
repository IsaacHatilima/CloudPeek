export class CloudApiNotConnectedError extends Error {
  constructor() {
    super("Cloud Peek is not connected to the Laravel Cloud API: no token is configured.");
    this.name = "CloudApiNotConnectedError";
  }
}

export class CloudApiError extends Error {
  /** HTTP status, or 0 when no response arrived at all (network failure). */
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "CloudApiError";
    this.status = status;
  }
}

/** One sentence a screen can show for any failure the client produces. */
export function describeApiError(error: unknown): string {
  if (error instanceof CloudApiNotConnectedError) return "Connect an organization first.";
  if (error instanceof CloudApiError) {
    if (error.status === 401) {
      return "Laravel Cloud rejected the token for this request. Reconnect the organization with a current API token.";
    }
    if (error.status === 403) return "This token does not have permission for this action. Check its permissions in Laravel Cloud.";
    return error.message;
  }
  return error instanceof Error ? error.message : String(error);
}

export function isAuthenticationError(error: unknown): boolean {
  return error instanceof CloudApiNotConnectedError || (error instanceof CloudApiError && error.status === 401);
}

/** Retrying invalid credentials or denied access cannot recover the request. */
export function shouldRetryCloudQuery(failures: number, error: unknown): boolean {
  if (isAuthenticationError(error)) return false;
  if (error instanceof CloudApiError && [403, 404, 422].includes(error.status)) return false;
  return failures < 1;
}
