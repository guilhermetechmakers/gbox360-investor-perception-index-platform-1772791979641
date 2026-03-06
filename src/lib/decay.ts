/**
 * Exponential time-decay for narrative weights.
 * weight = base_weight * exp(-lambda * delta_time_in_seconds)
 */

const SECONDS_PER_DAY = 24 * 60 * 60

/**
 * Compute current decay-adjusted weight.
 * @param baseWeight - Initial weight (e.g. 1)
 * @param lambda - Decay rate (default 0.01 ≈ half-life ~69 days in seconds scale)
 * @param lastDecayTime - ISO timestamp of last update
 * @param now - Optional current time (default Date.now())
 */
export function computeDecayWeight(
  baseWeight: number,
  lambda: number,
  lastDecayTime: string | null | undefined,
  now?: number
): number {
  const base = Number(baseWeight) || 0
  const lam = Number(lambda) >= 0 ? Number(lambda) : 0.01
  const t = now ?? Date.now()
  const last = lastDecayTime ? new Date(lastDecayTime).getTime() : t
  const deltaSeconds = Math.max(0, (t - last) / 1000)
  return base * Math.exp(-lam * deltaSeconds)
}

/**
 * Delta time in seconds for decay calculation (for testing).
 */
export function getDeltaSeconds(
  lastDecayTime: string | null | undefined,
  now?: number
): number {
  const t = now ?? Date.now()
  const last = lastDecayTime ? new Date(lastDecayTime).getTime() : t
  return Math.max(0, (t - last) / 1000)
}

/**
 * Default lambda: ~0.01 gives half-life ~69 days when time is in seconds.
 * For hourly buckets: lambda ~ 0.00001 scales reasonably.
 */
export const DEFAULT_DECAY_LAMBDA = 0.01

/** Half-life in days for a given lambda (approximate, for display). */
export function halfLifeDays(lambda: number): number {
  if (lambda <= 0) return Infinity
  const halfLifeSeconds = Math.LN2 / lambda
  return halfLifeSeconds / SECONDS_PER_DAY
}
