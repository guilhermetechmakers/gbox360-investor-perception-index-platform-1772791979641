import { describe, it, expect } from "vitest"
import { z } from "zod"

const phoneRegex = /^[+]?[\d\s\-()]{10,20}$/
const profileDetailsSchema = z.object({
  phone: z.string().regex(phoneRegex, "Invalid phone number").optional().or(z.literal("")),
  timezone: z.string().min(1, "Timezone is required"),
  locale: z.string().min(1, "Locale is required"),
  emailVisibility: z.enum(["team", "private"]),
  notificationsEmail: z.boolean(),
  notificationsInApp: z.boolean(),
})

const inviteSchema = z.object({
  email: z.string().min(1, "Email required").email("Invalid email"),
  role: z.enum(["admin", "editor", "viewer"]),
})

const deliveryWindowSchema = z.object({
  start: z.string().regex(/^\d{2}:\d{2}$/, "Start must be HH:mm"),
  end: z.string().regex(/^\d{2}:\d{2}$/, "End must be HH:mm"),
})

describe("settings validators", () => {
  describe("profileDetailsSchema", () => {
    it("accepts valid profile details", () => {
      const result = profileDetailsSchema.safeParse({
        phone: "+1 555 123 4567",
        timezone: "America/New_York",
        locale: "en",
        emailVisibility: "team",
        notificationsEmail: true,
        notificationsInApp: true,
      })
      expect(result.success).toBe(true)
    })
    it("accepts empty phone", () => {
      const result = profileDetailsSchema.safeParse({
        phone: "",
        timezone: "America/New_York",
        locale: "en",
        emailVisibility: "team",
        notificationsEmail: false,
        notificationsInApp: false,
      })
      expect(result.success).toBe(true)
    })
    it("rejects invalid phone", () => {
      const result = profileDetailsSchema.safeParse({
        phone: "abc",
        timezone: "America/New_York",
        locale: "en",
        emailVisibility: "team",
        notificationsEmail: true,
        notificationsInApp: true,
      })
      expect(result.success).toBe(false)
    })
    it("rejects empty timezone", () => {
      const result = profileDetailsSchema.safeParse({
        phone: "",
        timezone: "",
        locale: "en",
        emailVisibility: "team",
        notificationsEmail: true,
        notificationsInApp: true,
      })
      expect(result.success).toBe(false)
    })
    it("rejects invalid emailVisibility", () => {
      const result = profileDetailsSchema.safeParse({
        phone: "",
        timezone: "UTC",
        locale: "en",
        emailVisibility: "public",
        notificationsEmail: true,
        notificationsInApp: true,
      })
      expect(result.success).toBe(false)
    })
  })

  describe("inviteSchema", () => {
    it("accepts valid invite", () => {
      const result = inviteSchema.safeParse({
        email: "user@example.com",
        role: "viewer",
      })
      expect(result.success).toBe(true)
    })
    it("rejects invalid email", () => {
      const result = inviteSchema.safeParse({
        email: "not-an-email",
        role: "editor",
      })
      expect(result.success).toBe(false)
    })
    it("rejects invalid role", () => {
      const result = inviteSchema.safeParse({
        email: "u@x.com",
        role: "owner",
      })
      expect(result.success).toBe(false)
    })
  })

  describe("deliveryWindowSchema", () => {
    it("accepts valid HH:mm", () => {
      const result = deliveryWindowSchema.safeParse({ start: "09:00", end: "18:00" })
      expect(result.success).toBe(true)
    })
    it("rejects invalid start format", () => {
      const result = deliveryWindowSchema.safeParse({ start: "9:00", end: "18:00" })
      expect(result.success).toBe(false)
    })
    it("rejects invalid end format", () => {
      const result = deliveryWindowSchema.safeParse({ start: "09:00", end: "6:00" })
      expect(result.success).toBe(false)
    })
  })
})
