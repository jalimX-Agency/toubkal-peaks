const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
  }
}

type ApiOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string;
  /** Next.js fetch cache tags, for on-demand revalidation */
  tags?: string[];
  /** Seconds, or false to cache indefinitely */
  revalidate?: number | false;
};

export async function api<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const { body, token, tags, revalidate, headers, ...rest } = opts;
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    next: { tags, revalidate },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => undefined);
    throw new ApiError(
      res.status,
      (data as { message?: string } | undefined)?.message ?? res.statusText,
      data,
    );
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}
