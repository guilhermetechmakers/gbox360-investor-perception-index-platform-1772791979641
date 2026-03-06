import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AnimatedPage } from "@/components/AnimatedPage"
import { Users, UserPlus, UserX } from "lucide-react"
import { useAdminUsers, useAdminTenants, useAdminUserInvite, useAdminUserDeactivate } from "@/hooks/useAdmin"
import { safeArray } from "@/lib/data-guard"
import { cn } from "@/lib/utils"

const inviteSchema = z.object({
  email: z.string().min(1, "Email required").email("Invalid email"),
  name: z.string().optional(),
  role: z.string().min(1, "Role required"),
})

type InviteFormValues = z.infer<typeof inviteSchema>

const ROLE_OPTIONS = [
  { value: "VIEWER", label: "Viewer" },
  { value: "ANALYST", label: "Analyst" },
  { value: "ENTERPRISE_ADMIN", label: "Enterprise Admin" },
  { value: "PLATFORM_ADMIN", label: "Platform Admin" },
]

export default function AdminUserManagement() {
  const [tenantId, setTenantId] = useState<string>("")
  const [inviteOpen, setInviteOpen] = useState(false)
  const [deactivateId, setDeactivateId] = useState<string | null>(null)

  const { data: tenants = [] } = useAdminTenants()
  const { data: users = [], isLoading } = useAdminUsers(tenantId || null)
  const inviteMutation = useAdminUserInvite()
  const deactivateMutation = useAdminUserDeactivate(tenantId)

  const tenantsList = safeArray(tenants)
  const usersList = safeArray(users)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: "", name: "", role: "VIEWER" },
  })

  const onInvite = (values: InviteFormValues) => {
    if (!tenantId) return
    inviteMutation.mutate(
      { ...values, tenantId },
      {
        onSuccess: () => {
          reset()
          setInviteOpen(false)
        },
      }
    )
  }

  const onConfirmDeactivate = () => {
    if (!deactivateId || !tenantId) return
    deactivateMutation.mutate(deactivateId, { onSuccess: () => setDeactivateId(null) })
  }

  return (
    <AnimatedPage>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage users by tenant. Invite new users and assign roles; deactivate when needed.
          </p>
        </div>

        {/* Tenant selector */}
        <Card className="card-elevated rounded-[1rem] border border-border bg-card shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-lg">Select tenant</CardTitle>
            <CardDescription>Choose a tenant to view and manage its users</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={tenantId || "none"} onValueChange={(v) => setTenantId(v === "none" ? "" : v)}>
              <SelectTrigger className="max-w-xs">
                <SelectValue placeholder="Select tenant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select tenant</SelectItem>
                {tenantsList.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* User list */}
        <Card className="card-elevated rounded-[1rem] border border-border bg-card shadow-card">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 font-display">
                <Users className="h-5 w-5 text-primary" />
                Users
              </CardTitle>
              <CardDescription>Users for the selected tenant</CardDescription>
            </div>
            {tenantId && (
              <Button onClick={() => setInviteOpen(true)} className="gap-2">
                <UserPlus className="h-4 w-4" />
                Invite user
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {!tenantId ? (
              <div className="rounded-lg border border-dashed border-border py-12 text-center text-muted-foreground">
                Select a tenant to view users.
              </div>
            ) : isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : usersList.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border py-12 text-center text-muted-foreground">
                No users in this tenant. Invite a user to get started.
              </div>
            ) : (
              <ScrollArea className="w-full">
                <div className="min-w-[520px]">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="p-3 text-left font-medium">Name</th>
                        <th className="p-3 text-left font-medium">Email</th>
                        <th className="p-3 text-left font-medium">Roles</th>
                        <th className="p-3 text-left font-medium">Status</th>
                        <th className="p-3 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map((u) => (
                        <tr
                          key={u.id}
                          className="border-b border-border transition-colors hover:bg-muted/30"
                        >
                          <td className="p-3">{u.name || "—"}</td>
                          <td className="p-3">{u.email}</td>
                          <td className="p-3">
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                              {(u.roles ?? []).join(", ") || "—"}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-xs font-medium",
                                u.status === "ACTIVE" && "bg-green-100 text-green-800",
                                u.status === "DEACTIVATED" && "bg-muted text-muted-foreground"
                              )}
                            >
                              {u.status}
                            </span>
                          </td>
                          <td className="p-3">
                            {u.status === "ACTIVE" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 gap-1 text-destructive hover:text-destructive"
                                onClick={() => setDeactivateId(u.id)}
                              >
                                <UserX className="h-4 w-4" />
                                Deactivate
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invite modal */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite user</DialogTitle>
            <DialogDescription>Send an invitation to join this tenant</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onInvite)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="user@company.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-name">Name (optional)</Label>
                <Input id="invite-name" placeholder="Full name" {...register("name")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-role">Role</Label>
                <Select
                  onValueChange={(v) => setValue("role", v)}
                  defaultValue={watch("role")}
                >
                  <SelectTrigger id="invite-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-destructive">{errors.role.message}</p>
                )}
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

      {/* Deactivate confirmation */}
      <Dialog open={!!deactivateId} onOpenChange={(open) => !open && setDeactivateId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate user</DialogTitle>
            <DialogDescription>
              This user will lose access. You can reactivate them later if needed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeactivateId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onConfirmDeactivate} disabled={deactivateMutation.isPending}>
              {deactivateMutation.isPending ? "Deactivating…" : "Deactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AnimatedPage>
  )
}
