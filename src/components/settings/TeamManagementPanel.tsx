import { useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus, Search } from "lucide-react"
import { useSettingsTeam, useSettingsTeamInvite, useSettingsTeamRoleUpdate, useSettingsTeamRemove } from "@/hooks/useSettings"
import { ConfirmationDialog } from "@/components/admin/user-management"
import { useDebounce } from "@/hooks/useDebounce"
import type { TeamMember, TeamRole } from "@/types/settings"
import { safeArray } from "@/lib/data-guard"
import { cn } from "@/lib/utils"

const inviteSchema = z.object({
  email: z.string().min(1, "Email required").email("Invalid email"),
  role: z.enum(["owner", "admin", "editor", "viewer"]),
})

type InviteFormValues = z.infer<typeof inviteSchema>

const ROLE_OPTIONS: { value: TeamRole; label: string }[] = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
]

export function TeamManagementPanel() {
  const { data: teamData, isLoading } = useSettingsTeam(true)
  const inviteMutation = useSettingsTeamInvite()
  const roleMutation = useSettingsTeamRoleUpdate()
  const removeMutation = useSettingsTeamRemove()

  const [inviteOpen, setInviteOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [removeId, setRemoveId] = useState<string | null>(null)

  const debouncedSearch = useDebounce(search, 300)

  const team = safeArray(teamData) as TeamMember[]

  const filteredTeam = useMemo(() => {
    let list = team ?? []
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase()
      list = list.filter(
        (m) =>
          m.email?.toLowerCase().includes(q) ||
          m.name?.toLowerCase().includes(q)
      )
    }
    if (roleFilter && roleFilter !== "all") {
      list = list.filter((m) => m.role === roleFilter)
    }
    return list
  }, [team, debouncedSearch, roleFilter])

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: "", role: "viewer" },
  })

  const handleInvite = (values: InviteFormValues) => {
    inviteMutation.mutate(
      { email: values.email, role: values.role },
      {
        onSuccess: () => {
          form.reset()
          setInviteOpen(false)
        },
      }
    )
  }

  const handleRoleChange = (userId: string, role: string) => {
    roleMutation.mutate({ userId, role })
  }

  const onConfirmRemove = () => {
    if (removeId) {
      removeMutation.mutate(removeId, { onSuccess: () => setRemoveId(null) })
    }
  }

  if (isLoading) {
    return (
      <Card className="card-elevated rounded-[1.25rem] border border-border bg-card shadow-card">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-elevated rounded-[1.25rem] border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2 font-display">
            <Users className="h-5 w-5 text-primary" />
            Team Management
          </CardTitle>
          <CardDescription>
            Invite users, assign roles, and manage tenant access.
          </CardDescription>
        </div>
        <Button onClick={() => setInviteOpen(true)} size="sm" className="gap-2">
          <UserPlus className="h-4 w-4" />
          Invite
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              aria-label="Search team members"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {ROLE_OPTIONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredTeam.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-12 px-6 text-center">
            <Users className="h-10 w-10 text-muted-foreground" aria-hidden />
            <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
              No team members found
            </h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              {team.length === 0
                ? "Invite users to get started."
                : "No members match your search or filter."}
            </p>
            {team.length === 0 && (
              <Button className="mt-6" onClick={() => setInviteOpen(true)}>
                Invite member
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTeam.map((member) => (
              <div
                key={member.userId}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border p-4"
              >
                <div>
                  <p className="font-medium">{member.name ?? member.email}</p>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                  <Badge variant="secondary" className="mt-1">
                    {member.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={member.role}
                    onValueChange={(v) => handleRoleChange(member.userId, v)}
                    disabled={roleMutation.isPending}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={member.role === "owner"}
                    onClick={() => setRemoveId(member.userId)}
                    className="text-destructive hover:text-destructive"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite team member</DialogTitle>
            <DialogDescription>
              Send an invitation email. The user will receive a link to join.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleInvite)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="user@company.com"
                  {...form.register("email")}
                  className={cn(form.formState.errors.email && "border-destructive")}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-role">Role</Label>
                <Select
                  value={form.watch("role")}
                  onValueChange={(v) => form.setValue("role", v as TeamRole)}
                >
                  <SelectTrigger id="invite-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={inviteMutation.isPending}>
                {inviteMutation.isPending ? "Sending…" : "Send invitation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={!!removeId}
        onOpenChange={(open) => !open && setRemoveId(null)}
        title="Remove team member"
        description="This user will lose access. You can invite them again later."
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={onConfirmRemove}
        isLoading={removeMutation.isPending}
      />
    </Card>
  )
}
