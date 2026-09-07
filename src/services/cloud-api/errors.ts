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
      return "Laravel Cloud rejected the token. It may have expired or been revoked.";
    }
    if (error.status === 403) return "This token is not allowed to view that.";
    return error.message;
  }
  return error instanceof Error ? error.message : String(error);
}
