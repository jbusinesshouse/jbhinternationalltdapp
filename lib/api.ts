import { supabase } from "@/lib/supabase";

/**
 * Express BFF base URL, e.g. http://localhost:4000/api/v1
 * Android emulator: http://10.0.2.2:4000/api/v1
 * Physical device: http://<your-lan-ip>:4000/api/v1
 */
const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

function assertApiUrl() {
  if (!API_URL) {
    throw new ApiError(
      "API URL is not configured. Set EXPO_PUBLIC_API_URL in .env",
      500
    );
  }
}

function resolvePath(path: string): string {
  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

async function parseJsonResponse(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function throwIfNotOk(res: Response, json: unknown): void {
  if (res.ok) return;
  const errObj = json as { error?: string; code?: string } | null;
  throw new ApiError(
    errObj?.error || `Request failed (${res.status})`,
    res.status,
    errObj?.code
  );
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  /**
   * true (default): require token
   * false: never send token
   * "optional": send token when signed in
   */
  auth?: boolean | "optional";
  signal?: AbortSignal;
  /** Sent as Idempotency-Key for safe retries on money mutations. */
  idempotencyKey?: string;
};

/** Stable-enough client key for one user action (retry-safe). */
export function newIdempotencyKey(): string {
  const c = globalThis.crypto as Crypto | undefined;
  if (c?.randomUUID) return c.randomUUID();
  return `idemp_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

/**
 * JSON client for the Express BFF.
 */
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  assertApiUrl();

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (options.idempotencyKey) {
    headers["Idempotency-Key"] = options.idempotencyKey;
  }

  const authMode = options.auth === undefined ? true : options.auth;
  if (authMode === true) {
    const token = await getAccessToken();
    if (!token) {
      throw new ApiError("Not signed in", 401);
    }
    headers.Authorization = `Bearer ${token}`;
  } else if (authMode === "optional") {
    const token = await getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(resolvePath(path), {
    method: options.method ?? (options.body !== undefined ? "POST" : "GET"),
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });

  const json = await parseJsonResponse(res);
  throwIfNotOk(res, json);
  return json as T;
}

type UploadOptions = {
  auth?: boolean;
  signal?: AbortSignal;
  method?: "POST" | "PUT" | "PATCH";
};

/**
 * Multipart upload. Do not set Content-Type — fetch/RN sets the boundary.
 */
export async function apiUpload<T>(
  path: string,
  formData: FormData,
  options: UploadOptions = {}
): Promise<T> {
  assertApiUrl();

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  const needsAuth = options.auth !== false;
  if (needsAuth) {
    const token = await getAccessToken();
    if (!token) {
      throw new ApiError("Not signed in", 401);
    }
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(resolvePath(path), {
    method: options.method ?? "POST",
    headers,
    body: formData,
    signal: options.signal,
  });

  const json = await parseJsonResponse(res);
  throwIfNotOk(res, json);
  return json as T;
}

/** Build a RN-friendly file part for FormData. */
export function filePartFromUri(
  uri: string,
  name = "photo.jpg",
  type = "image/jpeg"
): { uri: string; name: string; type: string } {
  return { uri, name, type };
}

export function getApiBaseUrl(): string {
  return API_URL;
}
