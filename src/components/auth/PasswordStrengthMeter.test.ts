import { describe, it, expect } from "vitest"
import { computePasswordStrength } from "./PasswordStrengthMeter"

describe("computePasswordStrength", () => {
  it("returns score 0 for empty password", () => {
    const r = computePasswordStrength("")
    expect(r.score).toBe(0)
    expect(r.meetsMinLength).toBe(false)
    expect(r.hasUppercase).toBe(false)
    expect(r.hasLowercase).toBe(false)
    expect(r.hasNumber).toBe(false)
    expect(r.hasSymbol).toBe(false)
  })

  it("returns score 0 for null/undefined input", () => {
    const r1 = computePasswordStrength(null as unknown as string)
    expect(r1.score).toBe(0)
    const r2 = computePasswordStrength(undefined as unknown as string)
    expect(r2.score).toBe(0)
  })

  it("meets min length at 8 characters", () => {
    expect(computePasswordStrength("12345678").meetsMinLength).toBe(true)
    expect(computePasswordStrength("1234567").meetsMinLength).toBe(false)
  })

  it("detects uppercase", () => {
    expect(computePasswordStrength("A").hasUppercase).toBe(true)
    expect(computePasswordStrength("a").hasUppercase).toBe(false)
  })

  it("detects lowercase", () => {
    expect(computePasswordStrength("a").hasLowercase).toBe(true)
    expect(computePasswordStrength("A").hasLowercase).toBe(false)
  })

  it("detects number", () => {
    expect(computePasswordStrength("1").hasNumber).toBe(true)
    expect(computePasswordStrength("a").hasNumber).toBe(false)
  })

  it("detects symbol", () => {
    expect(computePasswordStrength("!").hasSymbol).toBe(true)
    expect(computePasswordStrength("@").hasSymbol).toBe(true)
    expect(computePasswordStrength("a").hasSymbol).toBe(false)
  })

  it("returns score 5 for strong password", () => {
    const r = computePasswordStrength("MyP@ssw0rd")
    expect(r.score).toBe(5)
    expect(r.label).toBe("Very strong")
    expect(r.meetsMinLength).toBe(true)
    expect(r.hasUppercase).toBe(true)
    expect(r.hasLowercase).toBe(true)
    expect(r.hasNumber).toBe(true)
    expect(r.hasSymbol).toBe(true)
  })

  it("returns correct label for each score level", () => {
    expect(computePasswordStrength("").label).toBe("Very weak")
    expect(computePasswordStrength("a").label).toBe("Weak")
    // 2 rules: minLength + lowercase
    expect(computePasswordStrength("abcdefgh").label).toBe("Fair")
    // 3 rules: minLength + upper + lower
    expect(computePasswordStrength("Abcdefgh").label).toBe("Good")
    // 4 rules
    expect(computePasswordStrength("Ab1defgh").label).toBe("Strong")
    // 5 rules
    expect(computePasswordStrength("Ab1!xxxx").label).toBe("Very strong")
  })
})
