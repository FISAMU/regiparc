// ============================================================
// Client HTTP centralisé pour les appels à l'API Django REST
// ============================================================

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  cache?: RequestCache;
  revalidate?: number;
};

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function getAuthHeaders(): Promise<HeadersInit> {
  if (typeof window !== "undefined") {
    const token =
      localStorage.getItem("auth_token") ||
      sessionStorage.getItem("auth_token");
    if (token) {
      return { Authorization: `Token ${token}` };
    }
    return {};
  }

  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (token) {
      return { Authorization: `Token ${token}` };
    }
  } catch {
    // Outside Next.js request context.
  }

  return {};
}

async function request<T>(
  url: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, cache, revalidate } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(await getAuthHeaders()),
  };

  const fetchOptions: RequestInit = {
    method,
    headers,
    ...(cache ? { cache } : {}),
    ...(revalidate !== undefined
      ? { next: { revalidate } }
      : {}),
  };

  if (body !== undefined && method !== "GET") {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url, fetchOptions);

  // Si 401, déconnecter l'utilisateur
  if (response.status === 401 && typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("auth_user");
    window.location.href = "/auth/sign-in";
    throw new ApiError(401, "Session expirée. Veuillez vous reconnecter.");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    let message = `Erreur API ${response.status}: ${response.statusText}`;

    if (data && typeof data === "object") {
      const payload = data as Record<string, unknown>;
      if (typeof payload.error === "string") {
        message = payload.error;
      } else if (typeof payload.detail === "string") {
        message = payload.detail;
      } else {
        const firstFieldError = Object.values(payload).find(
          (value) => Array.isArray(value) && typeof value[0] === "string",
        ) as string[] | undefined;
        if (firstFieldError?.[0]) {
          message = firstFieldError[0];
        }
      }
    }

    throw new ApiError(response.status, message, data);
  }

  return data as T;
}

export const apiClient = {
  get: <T>(url: string, opts?: Pick<RequestOptions, "cache" | "revalidate">) =>
    request<T>(url, { method: "GET", ...opts }),

  post: <T>(url: string, body: unknown) =>
    request<T>(url, { method: "POST", body }),

  put: <T>(url: string, body: unknown) =>
    request<T>(url, { method: "PUT", body }),

  patch: <T>(url: string, body: unknown) =>
    request<T>(url, { method: "PATCH", body }),

  delete: <T = void>(url: string) =>
    request<T>(url, { method: "DELETE" }),
};

export { ApiError };
