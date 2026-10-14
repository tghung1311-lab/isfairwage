const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

interface ApiErrorResponse {
  detail?: string;
}

export class ApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

interface ApiRequestOptions extends Omit<RequestInit, "body" | "headers"> {
  body?: unknown;
  token?: string | null;
  headers?: HeadersInit;
}

export async function apiRequest<T>(
  path: string,
  { body, token, headers, ...options }: ApiRequestOptions = {}
): Promise<T> {
  const requestHeaders = new Headers(headers);
  requestHeaders.set("Content-Type", "application/json");

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const responseBody = (await response.json().catch(() => null)) as ApiErrorResponse | T | null;

    if (!response.ok) {
      const message =
        responseBody && typeof responseBody === "object" && "detail" in responseBody
          ? responseBody.detail
          : "Something went wrong. Please try again.";
      throw new ApiError(typeof message === "string" ? message : "Something went wrong.", response.status);
    }

    return responseBody as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Unable to reach the server. Please try again.");
  }
}