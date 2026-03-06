export interface Company {
  id: string
  ticker: string
  name: string
  sector?: string
  created_at: string
  /** Optional metadata for search/filter (industry, country, headquarters) */
  metadata?: {
    industry?: string
    country?: string
    headquarters?: string
    [k: string]: unknown
  }
}
