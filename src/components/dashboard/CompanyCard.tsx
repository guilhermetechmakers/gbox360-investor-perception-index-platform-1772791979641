import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Building2, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface CompanyCardProps {
  id: string
  name: string
  ticker: string
  ipi?: number
  changeDirection?: "up" | "down" | "neutral"
  changeValue?: number
}

export function CompanyCard({
  id,
  name,
  ticker,
  ipi,
  changeDirection = "neutral",
  changeValue,
}: CompanyCardProps) {
  const to = `/dashboard/company/${id}`

  const ChangeIcon =
    changeDirection === "up"
      ? TrendingUp
      : changeDirection === "down"
        ? TrendingDown
        : Minus

  const changeColor =
    changeDirection === "up"
      ? "text-green-600"
      : changeDirection === "down"
        ? "text-red-600"
        : "text-muted-foreground"

  return (
    <Link to={to}>
      <Card className="group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{name}</p>
              <p className="text-sm text-muted-foreground">{ticker}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {typeof ipi === "number" && (
              <span className="font-display text-lg font-semibold">{ipi}</span>
            )}
            <ChangeIcon className={cn("h-5 w-5", changeColor)} aria-hidden />
            {typeof changeValue === "number" && changeValue !== 0 && (
              <span className={cn("text-sm font-medium", changeColor)}>
                {changeValue > 0 ? "+" : ""}
                {changeValue}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
