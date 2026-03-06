import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CompanyTimeWindowSelect } from "./CompanyTimeWindowSelect"
import { Play, Download, Building2 } from "lucide-react"
import type { WatchedCompany } from "@/types/dashboard"

interface QuickActionsCardProps {
  watchedCompanies: WatchedCompany[]
  className?: string
}

export function QuickActionsCard({
  watchedCompanies,
  className,
}: QuickActionsCardProps) {
  const [timeWindow, setTimeWindow] = useState("1W")
  const navigate = useNavigate()
  const items = Array.isArray(watchedCompanies) ? watchedCompanies : []
  const firstCompanyId = items.length > 0 ? items[0].id : null

  const handleReplay = () => {
    if (firstCompanyId) {
      navigate(`/dashboard/company/${firstCompanyId}/drill-down?window=${timeWindow}`)
    } else {
      navigate("/dashboard/companies")
    }
  }

  const handleExport = () => {
    if (firstCompanyId) {
      navigate(`/dashboard/company/${firstCompanyId}?window=${timeWindow}`)
    } else {
      navigate("/dashboard/companies")
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="h-5 w-5" />
          Quick actions
        </CardTitle>
        <CardDescription>
          Set time window and open drill-down or export for a company. Use search above to select a company.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Time window</span>
          <CompanyTimeWindowSelect
            value={timeWindow}
            onChange={setTimeWindow}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 transition-transform hover:scale-[1.02] hover:shadow-md"
            onClick={handleReplay}
          >
            <Play className="h-4 w-4" aria-hidden />
            Drill-down / Replay
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 transition-transform hover:scale-[1.02] hover:shadow-md"
            onClick={handleExport}
          >
            <Download className="h-4 w-4" aria-hidden />
            Export
          </Button>
          <Link to="/dashboard/companies">
            <Button variant="secondary" size="sm" className="gap-2">
              <Building2 className="h-4 w-4" aria-hidden />
              Browse companies
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
