import { describe, it, expect } from "vitest"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
})

const signupSchema = z.object({
  companyName: z.string().min(1, "Company name is required").trim(),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/, "Password must contain at least one symbol"),
  userRole: z.enum(["Analyst", "IR", "Admin"] as const),
  agreeToTOS: z.boolean().refine((v) => v === true, "You must accept the Terms of Service"),
})

describe("auth Zod schemas", () => {
  describe("loginSchema", () => {
    it("accepts valid email and password", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "secret",
      })
      expect(result.success).toBe(true)
    })

    it("rejects empty email", () => {
      const result = loginSchema.safeParse({ email: "", password: "x" })
      expect(result.success).toBe(false)
    })

    it("rejects invalid email", () => {
      const result = loginSchema.safeParse({ email: "not-an-email", password: "x" })
      expect(result.success).toBe(false)
    })

    it("rejects empty password", () => {
      const result = loginSchema.safeParse({ email: "u@x.com", password: "" })
      expect(result.success).toBe(false)
    })

    it("accepts optional rememberMe", () => {
      const result = loginSchema.safeParse({
        email: "u@x.com",
        password: "x",
        rememberMe: true,
      })
      expect(result.success).toBe(true)
    })
  })

  describe("signupSchema", () => {
    it("accepts valid signup payload", () => {
      const result = signupSchema.safeParse({
        companyName: "Acme",
        email: "u@example.com",
        password: "MyP@ssw0rd",
        userRole: "Analyst",
        agreeToTOS: true,
      })
      expect(result.success).toBe(true)
    })

    it("rejects password without uppercase", () => {
      const result = signupSchema.safeParse({
        companyName: "Acme",
        email: "u@x.com",
        password: "myp@ssw0rd",
        userRole: "Analyst",
        agreeToTOS: true,
      })
      expect(result.success).toBe(false)
    })

    it("rejects password shorter than 8 characters", () => {
      const result = signupSchema.safeParse({
        companyName: "Acme",
        email: "u@x.com",
        password: "Ab1!",
        userRole: "Analyst",
        agreeToTOS: true,
      })
      expect(result.success).toBe(false)
    })

    it("rejects when agreeToTOS is false", () => {
      const result = signupSchema.safeParse({
        companyName: "Acme",
        email: "u@x.com",
        password: "MyP@ssw0rd",
        userRole: "Analyst",
        agreeToTOS: false,
      })
      expect(result.success).toBe(false)
    })

    it("rejects invalid userRole", () => {
      const result = signupSchema.safeParse({
        companyName: "Acme",
        email: "u@x.com",
        password: "MyP@ssw0rd",
        userRole: "Other",
        agreeToTOS: true,
      })
      expect(result.success).toBe(false)
    })
  })
})
