import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useCompanies } from "@/hooks/useCompanies"
import { AnimatedPage } from "@/components/AnimatedPage"
import { Building2, Plus, TrendingUp } from "lucide-react"

export default function Dashboard() {
  const { data: companies, isLoading } = useCompanies()

  return (
    <AnimatedPage>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">Your watchlist and recent IPI shifts.</p>
        </div>

        {/* Watchlist / Quick company access */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Watchlist
            </CardTitle>
            <CardDescription>Companies you follow. Select one to view IPI.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : companies && companies.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {companies.slice(0, 6).map((c) => (
                  <Link key={c.id} to={`/dashboard/company/${c.id}`}>
                    <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md">
                      <CardContent className="flex items-center justify-between p-4">
                        <div>
                          <p className="font-medium">{c.name}</p>
                          <p className="text-sm text-muted-foreground">{c.ticker}</p>
                        </div>
                        <TrendingUp className="h-5 w-5 text-primary" />
                      </CardContent>
                    </Card>
                  </Link>
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

        {/* Recent alerts placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Recent alerts</CardTitle>
            <CardDescription>Significant IPI movements.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-dashed border-border py-8 text-center text-muted-foreground">
              No recent alerts. Alerts will appear when IPI moves beyond thresholds.
            </div>
          </CardContent>
        </Card>

        {/* Quick actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Link to="/dashboard/companies">
            <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Browse companies</p>
                  <p className="text-sm text-muted-foreground">Search and add to watchlist</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/dashboard/settings">
            <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/20">
                  <TrendingUp className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="font-medium">Settings</p>
                  <p className="text-sm text-muted-foreground">Notifications & preferences</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </AnimatedPage>
  )
}
