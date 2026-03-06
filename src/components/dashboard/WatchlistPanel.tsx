import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CompanyCard } from "./CompanyCard"
import { Building2, Plus } from "lucide-react"
import { Link } from "react-router-dom"
import type { WatchedCompany } from "@/types/dashboard"

interface WatchlistPanelProps {
  watchedCompanies: WatchedCompany[]
  isLoading?: boolean
}

export function WatchlistPanel({
  watchedCompanies,
  isLoading = false,
}: WatchlistPanelProps) {
  const items = Array.isArray(watchedCompanies) ? watchedCompanies : []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Watchlist
        </CardTitle>
        <CardDescription>
          Companies you follow. Select one to view IPI.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : items.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((c) => (
              <CompanyCard
                key={c.id}
                id={c.id}
                name={c.name}
                ticker={c.ticker}
                ipi={c.ipi}
                changeDirection={c.changeDirection}
                changeValue={c.changeValue}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border py-8 text-center text-muted-foreground">
            <p>No companies in watchlist yet.</p>
            <Link to="/dashboard/companies">
              <Button variant="outline" className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Browse companies
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
