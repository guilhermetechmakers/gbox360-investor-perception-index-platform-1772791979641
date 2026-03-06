import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { RetentionCategory } from "@/content/privacy-policy"

interface RetentionTableProps {
  caption?: string
  summary?: string
  categories?: RetentionCategory[]
  className?: string
}

export function RetentionTable({
  caption = "Data retention periods by category",
  summary = "Table listing data categories, retention periods, and rationale for each",
  categories = [],
  className,
}: RetentionTableProps) {
  const items = Array.isArray(categories) ? categories : []

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="overflow-x-auto p-0">
        <Table>
          <TableCaption className="px-6 py-4 text-left text-sm font-medium text-foreground">
            {caption}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead scope="col" className="font-semibold text-foreground">
                Data Category
              </TableHead>
              <TableHead scope="col" className="font-semibold text-foreground">
                Data Types
              </TableHead>
              <TableHead scope="col" className="font-semibold text-foreground">
                Retention Period
              </TableHead>
              <TableHead scope="col" className="font-semibold text-foreground">
                Rationale
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((row, index) => (
              <TableRow key={row.category ?? index}>
                <TableCell className="font-medium">{row.category ?? ""}</TableCell>
                <TableCell>{row.dataTypes ?? ""}</TableCell>
                <TableCell>{row.retentionPeriod ?? ""}</TableCell>
                <TableCell className="text-muted-foreground">{row.rationale ?? ""}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <span className="sr-only">{summary}</span>
      </CardContent>
    </Card>
  )
}
