import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useState, useMemo } from "react"
import { Search } from "lucide-react"
import type { Tenant } from "@/types/admin"
import { cn } from "@/lib/utils"

interface TenantSelectorProps {
  tenants: Tenant[]
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  label?: string
  id?: string
}

export function TenantSelector({
  tenants,
  value,
  onValueChange,
  disabled = false,
  placeholder = "Select tenant",
  label = "Tenant / Company",
  id = "tenant-selector",
}: TenantSelectorProps) {
  const [search, setSearch] = useState("")
  const options = useMemo(() => {
    const list = Array.isArray(tenants) ? tenants : []
    if (!search.trim()) return list
    const q = search.toLowerCase()
    return list.filter(
      (t) =>
        (t.name ?? "").toLowerCase().includes(q) ||
        (t.id ?? "").toLowerCase().includes(q)
    )
  }, [tenants, search])

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" role="img" aria-hidden />
        <Input
          id={`${id}-search`}
          type="text"
          placeholder="Search tenants..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          aria-label="Search tenants"
        />
      </div>
      <Select value={value || "__all__"} onValueChange={(v) => onValueChange(v === "__all__" ? "" : v)} disabled={disabled}>
        <SelectTrigger id={id} className={cn(!value && "text-muted-foreground")}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">{placeholder}</SelectItem>
          {(options ?? []).map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.name ?? t.id}
            </SelectItem>
          ))}
          {options.length === 0 && search && (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              No tenants match &quot;{search}&quot;
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  )
}
