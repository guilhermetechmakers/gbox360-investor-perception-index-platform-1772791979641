import { describe, it, expect } from "vitest"
import {
  isValidEmail,
  isNotEmpty,
  isValidVAT,
  isValidCardNumber,
  isValidExpiry,
  isValidCvc,
} from "@/lib/checkout-validation"

describe("checkout-validation", () => {
  describe("isValidEmail", () => {
    it("returns true for valid emails", () => {
      expect(isValidEmail("a@b.co")).toBe(true)
      expect(isValidEmail("user@example.com")).toBe(true)
      expect(isValidEmail("  user@example.com  ")).toBe(true)
    })
    it("returns false for null/undefined/non-string", () => {
      expect(isValidEmail(null)).toBe(false)
      expect(isValidEmail(undefined)).toBe(false)
      expect(isValidEmail(123 as unknown as string)).toBe(false)
    })
    it("returns false for invalid emails", () => {
      expect(isValidEmail("")).toBe(false)
      expect(isValidEmail("no-at")).toBe(false)
      expect(isValidEmail("@nodomain.com")).toBe(false)
      expect(isValidEmail("user@")).toBe(false)
    })
  })

  describe("isNotEmpty", () => {
    it("returns true for non-empty string", () => {
      expect(isNotEmpty("a")).toBe(true)
      expect(isNotEmpty("  x  ")).toBe(true)
    })
    it("returns false for null/undefined/empty", () => {
      expect(isNotEmpty(null)).toBe(false)
      expect(isNotEmpty(undefined)).toBe(false)
      expect(isNotEmpty("")).toBe(false)
      expect(isNotEmpty("   ")).toBe(false)
    })
  })

  describe("isValidVAT", () => {
    it("returns true when empty (optional)", () => {
      expect(isValidVAT("")).toBe(true)
      expect(isValidVAT("   ")).toBe(true)
      expect(isValidVAT(null)).toBe(true)
    })
    it("returns true for valid VAT-like format", () => {
      expect(isValidVAT("DE123456789")).toBe(true)
      expect(isValidVAT("FR12345678901")).toBe(true)
    })
    it("returns false for invalid format", () => {
      expect(isValidVAT("short")).toBe(false)
      expect(isValidVAT("123")).toBe(false)
    })
  })

  describe("isValidCardNumber", () => {
    it("returns true for 13–19 digits", () => {
      expect(isValidCardNumber("4111111111111")).toBe(true)
      expect(isValidCardNumber("4111111111111111")).toBe(true)
      expect(isValidCardNumber("4111 1111 1111 1111")).toBe(true)
    })
    it("returns false for null/undefined/short/long", () => {
      expect(isValidCardNumber(null)).toBe(false)
      expect(isValidCardNumber(undefined)).toBe(false)
      expect(isValidCardNumber("123")).toBe(false)
      expect(isValidCardNumber("12345678901234567890")).toBe(false)
    })
  })

  describe("isValidExpiry", () => {
    it("returns true for future MM/YY", () => {
      const nextYear = new Date().getFullYear() + 1
      const yy = String(nextYear).slice(-2)
      expect(isValidExpiry(`12/${yy}`)).toBe(true)
      expect(isValidExpiry(`01/${yy}`)).toBe(true)
    })
    it("returns false for null/undefined", () => {
      expect(isValidExpiry(null)).toBe(false)
      expect(isValidExpiry(undefined)).toBe(false)
    })
    it("returns false for invalid month", () => {
      expect(isValidExpiry("00/30")).toBe(false)
      expect(isValidExpiry("13/30")).toBe(false)
    })
    it("returns false for past date", () => {
      expect(isValidExpiry("01/20")).toBe(false)
    })
  })

  describe("isValidCvc", () => {
    it("returns true for 3–4 digits", () => {
      expect(isValidCvc("123")).toBe(true)
      expect(isValidCvc("1234")).toBe(true)
      expect(isValidCvc(" 123 ")).toBe(true)
    })
    it("returns false for null/undefined/short/long", () => {
      expect(isValidCvc(null)).toBe(false)
      expect(isValidCvc(undefined)).toBe(false)
      expect(isValidCvc("12")).toBe(false)
      expect(isValidCvc("12345")).toBe(false)
    })
  })
})
