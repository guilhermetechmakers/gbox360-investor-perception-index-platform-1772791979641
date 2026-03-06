import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserX, UserCheck, KeyRound, Pencil } from "lucide-react"
import { format } from "date-fns"
import type { AdminUser } from "@/types/admin"
import { cn } from "@/lib/utils"

function getInitials(name?: string, email?: string): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }
  if (email) {
    return email.slice(0, 2).toUpperCase()
  }
  return "?"
}

interface UserTableProps {
  users: AdminUser[]
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
  onEditRoles: (user: AdminUser) => void
  onDeactivate: (id: string) => void
  onActivate: (id: string) => void
  onResetPassword: (id: string) => void
}

export function UserTable({
  users,
  selectedIds,
  onSelectionChange,
  onEditRoles,
  onDeactivate,
  onActivate,
  onResetPassword,
}: UserTableProps) {
  const usersList = users ?? []
  const allSelected = usersList.length > 0 && selectedIds.length === usersList.length

  const toggleAll = () => {
    if (allSelected) {
      onSelectionChange([])
    } else {
      onSelectionChange(usersList.map((u) => u.id))
    }
  }

  const toggleOne = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((x) => x !== id))
    } else {
      onSelectionChange([...selectedIds, id])
    }
  }

  return (
    <TooltipProvider>
      {/* Desktop: table */}
      <div className="hidden md:block">
        <ScrollArea className="w-full">
          <div className="min-w-[720px]">
            <table
              className="w-full border-collapse text-sm"
              role="table"
              aria-label="User management table"
            >
              <thead>
                <tr className="sticky top-0 z-10 border-b border-border bg-muted/30">
                  <th className="w-12 p-3 text-left" scope="col">
                    <Checkbox
                      checked={allSelected}
                      aria-label="Select all"
                      onCheckedChange={toggleAll}
                    />
                  </th>
                  <th className="p-3 text-left font-medium" scope="col">
                    User
                  </th>
                  <th className="p-3 text-left font-medium" scope="col">
                    Roles
                  </th>
                  <th className="p-3 text-left font-medium" scope="col">
                    Tenants
                  </th>
                  <th className="p-3 text-left font-medium" scope="col">
                    Last login
                  </th>
                  <th className="p-3 text-left font-medium" scope="col">
                    Status
                  </th>
                  <th className="p-3 text-left font-medium" scope="col">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    selected={selectedIds.includes(user.id)}
                    onToggleSelect={() => toggleOne(user.id)}
                    onEditRoles={() => onEditRoles(user)}
                    onDeactivate={() => onDeactivate(user.id)}
                    onActivate={() => onActivate(user.id)}
                    onResetPassword={() => onResetPassword(user.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </div>

      {/* Mobile: cards */}
      <div className="space-y-3 md:hidden">
        {usersList.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            selected={selectedIds.includes(user.id)}
            onToggleSelect={() => toggleOne(user.id)}
            onEditRoles={() => onEditRoles(user)}
            onDeactivate={() => onDeactivate(user.id)}
            onActivate={() => onActivate(user.id)}
            onResetPassword={() => onResetPassword(user.id)}
          />
        ))}
      </div>
    </TooltipProvider>
  )
}

interface UserRowProps {
  user: AdminUser
  selected: boolean
  onToggleSelect: () => void
  onEditRoles: () => void
  onDeactivate: () => void
  onActivate: () => void
  onResetPassword: () => void
}

function UserCard({
  user,
  selected,
  onToggleSelect,
  onEditRoles,
  onDeactivate,
  onActivate,
  onResetPassword,
}: UserRowProps) {
  const tenants = user.tenants ?? []
  const tenantNames =
    tenants
      .map((t) => (t as { tenantName?: string; name?: string }).tenantName ?? (t as { name?: string }).name ?? "")
      .filter(Boolean)
      .join(", ") || user.tenantId || "—"
  const isActive = user.status === "ACTIVE"
  const statusLabel = isActive ? "Active" : "Deactivated"

  return (
    <Card className={cn("card-elevated rounded-[1.25rem] border border-border", selected && "ring-2 ring-primary/30")}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Checkbox checked={selected} aria-label={`Select ${user.email}`} onCheckedChange={onToggleSelect} />
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                {getInitials(user.name, user.email)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="font-medium truncate">{user.name || "—"}</div>
              <div className="text-sm text-muted-foreground truncate">{user.email}</div>
              <div className="mt-1 flex flex-wrap gap-1">
                {(user.roles ?? []).map((r) => (
                  <Badge key={r} variant="secondary" className="text-xs">
                    {r}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <Badge
            variant={isActive ? "success" : "secondary"}
            className={cn(
              "shrink-0",
              isActive && "bg-green-100 text-green-800",
              !isActive && "bg-muted text-muted-foreground"
            )}
          >
            {statusLabel}
          </Badge>
        </div>
        <p className="mt-2 text-xs text-muted-foreground truncate" title={tenantNames}>
          Tenants: {tenantNames}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Last login: {user.lastLogin ? format(new Date(user.lastLogin), "PP") : "—"}
        </p>
        <div className="mt-3 flex flex-wrap gap-1">
          <Button variant="ghost" size="sm" className="h-8 gap-1 text-primary hover:bg-primary/10" onClick={onEditRoles} aria-label={`Edit roles for ${user.email}`}>
            <Pencil className="h-4 w-4" />
            Edit roles
          </Button>
          {isActive ? (
            <>
              <Button variant="ghost" size="sm" className="h-8 gap-1 text-destructive hover:bg-destructive/10" onClick={onDeactivate} aria-label={`Deactivate ${user.email}`}>
                <UserX className="h-4 w-4" />
                Deactivate
              </Button>
              <Button variant="ghost" size="sm" className="h-8 gap-1 text-primary hover:bg-primary/10" onClick={onResetPassword} aria-label={`Reset password for ${user.email}`}>
                <KeyRound className="h-4 w-4" />
                Reset password
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" className="h-8 gap-1 text-primary hover:bg-primary/10" onClick={onActivate} aria-label={`Activate ${user.email}`}>
              <UserCheck className="h-4 w-4" />
              Activate
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function UserRow({
  user,
  selected,
  onToggleSelect,
  onEditRoles,
  onDeactivate,
  onActivate,
  onResetPassword,
}: UserRowProps) {
  const tenants = user.tenants ?? []
  const tenantNames =
    tenants
      .map((t) => (t as { tenantName?: string; name?: string }).tenantName ?? (t as { name?: string }).name ?? "")
      .filter(Boolean)
      .join(", ") || user.tenantId || "—"
  const isActive = user.status === "ACTIVE"
  const statusLabel = isActive ? "Active" : "Deactivated"

  return (
    <tr
      className={cn(
        "border-b border-border transition-colors hover:bg-muted/30",
        selected && "bg-primary/5"
      )}
      role="row"
    >
      <td className="p-3" role="cell">
        <Checkbox checked={selected} aria-label={`Select ${user.email}`} onCheckedChange={onToggleSelect} />
      </td>
      <td className="p-3" role="cell">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
              {getInitials(user.name, user.email)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.name || "—"}</div>
            <div className="text-muted-foreground">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="p-3" role="cell">
        <div className="flex flex-wrap gap-1">
          {(user.roles ?? []).map((r) => (
            <Badge key={r} variant="secondary" className="text-xs">
              {r}
            </Badge>
          ))}
          {(!user.roles || user.roles.length === 0) && "—"}
        </div>
      </td>
      <td className="p-3" role="cell">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="max-w-[140px] truncate block" title={tenantNames}>
              {tenantNames}
            </span>
          </TooltipTrigger>
          <TooltipContent>{tenantNames}</TooltipContent>
        </Tooltip>
      </td>
      <td className="p-3 text-muted-foreground" role="cell">
        {user.lastLogin ? format(new Date(user.lastLogin), "PP") : "—"}
      </td>
      <td className="p-3" role="cell">
        <Badge
          variant={isActive ? "success" : "secondary"}
          className={cn(
            isActive && "bg-green-100 text-green-800",
            !isActive && "bg-muted text-muted-foreground"
          )}
        >
          {statusLabel}
        </Badge>
      </td>
      <td className="p-3" role="cell">
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 text-primary hover:bg-primary/10"
                onClick={onEditRoles}
                aria-label={`Edit roles for ${user.email}`}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit roles</TooltipContent>
          </Tooltip>
          {isActive ? (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={onDeactivate}
                    aria-label={`Deactivate ${user.email}`}
                  >
                    <UserX className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Deactivate</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 text-primary hover:bg-primary/10"
                    onClick={onResetPassword}
                    aria-label={`Reset password for ${user.email}`}
                  >
                    <KeyRound className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reset password</TooltipContent>
              </Tooltip>
            </>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1 text-primary hover:bg-primary/10"
                  onClick={onActivate}
                  aria-label={`Activate ${user.email}`}
                >
                  <UserCheck className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Activate</TooltipContent>
            </Tooltip>
          )}
        </div>
      </td>
    </tr>
  )
}
