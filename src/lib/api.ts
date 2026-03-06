async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const base = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api"
  const url = `${base}${endpoint}`
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }
  const token = localStorage.getItem("auth_token")
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
  }

  const res = await fetch(url, { ...options, headers })
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("auth_token")
      window.location.href = "/auth"
    }
    let message = `API Error: ${res.status}`
    try {
      const text = await res.text()
      const body = text ? JSON.parse(text) : null
      const msg = body?.message ?? body?.error ?? body?.msg
      if (typeof msg === "string" && msg.trim()) message = msg
      else if (typeof text === "string" && text.trim()) message = text.slice(0, 200)
    } catch {
      /* use default message */
    }
    throw new Error(message)
  }
  return res.json()
}

export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint),
  post: <T>(endpoint: string, data: unknown) =>
    apiRequest<T>(endpoint, { method: "POST", body: JSON.stringify(data) }),
  put: <T>(endpoint: string, data: unknown) =>
    apiRequest<T>(endpoint, { method: "PUT", body: JSON.stringify(data) }),
  patch: <T>(endpoint: string, data: unknown) =>
    apiRequest<T>(endpoint, { method: "PATCH", body: JSON.stringify(data) }),
  delete: <T>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: "DELETE" }),
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  limit: number
}

export interface ApiErrorLike {
  message: string
  status?: number
  code?: string
}

export function createApiError(message: string, status?: number, code?: string): Error & ApiErrorLike {
  const err = new Error(message) as Error & ApiErrorLike
  err.status = status
  err.code = code
  return err
}
