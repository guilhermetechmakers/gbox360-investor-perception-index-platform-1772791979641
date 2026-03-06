import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { authApi } from "./auth"

describe("authApi", () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe("getMe", () => {
    it("returns null when response is invalid", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })
      const result = await authApi.getMe()
      expect(result).toBeNull()
    })

    it("returns null when response has no id or email", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "x" }),
      })
      const result = await authApi.getMe()
      expect(result).toBeNull()
    })

    it("returns normalized user when response is valid", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "usr-1",
          email: "u@example.com",
          full_name: "Full",
          role: "admin",
          mfa_enabled: true,
          is_email_verified: true,
        }),
      })
      const result = await authApi.getMe()
      expect(result).not.toBeNull()
      expect(result?.id).toBe("usr-1")
      expect(result?.email).toBe("u@example.com")
      expect(result?.full_name).toBe("Full")
      expect(result?.role).toBe("admin")
      expect(result?.mfa_enabled).toBe(true)
      expect(result?.is_email_verified).toBe(true)
    })

    it("maps roles array when present", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "usr-1",
          email: "u@example.com",
          roles: ["admin", "editor"],
        }),
      })
      const result = await authApi.getMe()
      expect(result?.roles).toEqual(["admin", "editor"])
    })

    it("maps single role to roles array when roles not provided", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "usr-1",
          email: "u@example.com",
          role: "viewer",
        }),
      })
      const result = await authApi.getMe()
      expect(result?.role).toBe("viewer")
      expect(result?.roles).toEqual(["viewer"])
    })

    it("returns null on fetch error", async () => {
      fetchMock.mockRejectedValueOnce(new Error("Network error"))
      const result = await authApi.getMe()
      expect(result).toBeNull()
    })
  })

  describe("signIn", () => {
    it("sends normalized payload and stores token on success", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: "jwt-123", user: { id: "1", email: "a@b.com" } }),
      })
      const setItem = vi.mocked(localStorage.setItem)
      const result = await authApi.signIn({
        email: "  User@Example.COM  ",
        password: "secret",
      })
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringMatching(/\/auth\/login$/),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            email: "user@example.com",
            password: "secret",
            remember_me: false,
          }),
        })
      )
      expect(setItem).toHaveBeenCalledWith("auth_token", "jwt-123")
      expect(result.token).toBe("jwt-123")
    })
  })

  describe("passwordResetRequest / resetPassword", () => {
    it("sends email in lowercase", async () => {
      fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({}) })
      await authApi.passwordResetRequest("  User@Example.COM  ")
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringMatching(/\/auth\/password-reset-request$/),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ email: "user@example.com" }),
        })
      )
    })
  })

  describe("verifyEmail", () => {
    it("returns verified true when backend returns verified", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ verified: true }),
      })
      const result = await authApi.verifyEmail("token-xyz")
      expect(result.verified).toBe(true)
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/auth/verify-email?"),
        expect.any(Object)
      )
    })

    it("returns verified false when backend does not return verified", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })
      const result = await authApi.verifyEmail("token-xyz")
      expect(result.verified).toBe(false)
    })
  })

  describe("getVerificationStatus", () => {
    it("returns valid status when backend returns pending/verified/failed", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: "verified", lastUpdated: "2025-01-01T00:00:00Z" }),
      })
      const result = await authApi.getVerificationStatus()
      expect(result.status).toBe("verified")
      expect(result.updatedAt).toBeDefined()
    })

    it("defaults to pending for invalid status", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: "unknown" }),
      })
      const result = await authApi.getVerificationStatus()
      expect(result.status).toBe("pending")
    })
  })

  describe("resendVerification", () => {
    it("returns success and cooldown from response", async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: "Sent", cooldown: 60 }),
      })
      const result = await authApi.resendVerification({ userId: "u1", email: "u@x.com" })
      expect(result.success).toBe(true)
      expect(result.message).toBe("Sent")
      expect(result.cooldown).toBe(60)
    })
  })
})
