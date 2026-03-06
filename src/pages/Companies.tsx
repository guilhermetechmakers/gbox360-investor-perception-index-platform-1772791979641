import { useState } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useCompanies } from "@/hooks/useCompanies"
import { AnimatedPage } from "@/components/AnimatedPage"
import { Building2, Search } from "lucide-react"

export default function Companies() {
  const [search, setSearch] = useState("")
  const { data: companies, isLoading } = useCompanies()

  const filtered =
    companies?.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.ticker.toLowerCase().includes(search.toLowerCase())
    ) ?? []

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold">Companies</h1>
          <p className="text-muted-foreground">Search and open a company to view IPI.</p>
        </div>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or ticker..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <Link key={c.id} to={`/dashboard/company/${c.id}`}>
                <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{c.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{c.ticker}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
        {!isLoading && filtered.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No companies match your search.
            </CardContent>
          </Card>
        )}
      </div>
    </AnimatedPage>
  )
}
