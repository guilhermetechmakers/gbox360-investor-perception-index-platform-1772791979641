import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CompanyCard } from "./CompanyCard"
import { Star } from "lucide-react"

interface RecommendedCompany {
  id: string
  name: string
  ticker: string
}

interface RecommendedCompaniesCardProps {
  companies: RecommendedCompany[]
  className?: string
}

export function RecommendedCompaniesCard({
  companies,
  className,
}: RecommendedCompaniesCardProps) {
  const items = Array.isArray(companies) ? companies : []

  if (items.length === 0) return null

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Star className="h-5 w-5 text-primary" aria-hidden />
          Recommended companies
        </CardTitle>
        <CardDescription>
          Add companies to your watchlist to track IPI and narratives.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <CompanyCard
              key={c.id}
              id={c.id}
              name={c.name}
              ticker={c.ticker}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
