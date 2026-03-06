import { useState, useMemo, useCallback } from "react"
import { useDebounce } from "@/hooks/useDebounce"
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
import { Skeleton } from "@/components/ui/skeleton"
import { AnimatedPage } from "@/components/AnimatedPage"
import { Users, UserPlus, ChevronLeft, ChevronRight } from "lucide-react"
import {
  useAdminUsers,
  useAdminTenants,
  useAdminRoles,
  useAdminUserInvite,
  useAdminUserDeactivate,
  useAdminUserReactivate,
  useAdminUserResetPassword,
  useAdminUserExport,
  useAdminUserAuditTrail,
} from "@/hooks/useAdmin"
import { safeArray } from "@/lib/data-guard"
import { DataAccessGuard } from "@/components/admin/DataAccessGuard"
import {
  InviteUserModal,
  ConfirmationDialog,
  RoleAssignmentEditor,
  BulkActionsBar,
  UserTable,
  AuditTrailPanel,
} from "@/components/admin/user-management"
import type { AdminUser, AdminUsersParams } from "@/types/admin"
import { type BulkAction } from "@/components/admin/user-management"

const PAGE_SIZE_OPTIONS = [25, 50, 100]
const DEFAULT_PAGE_SIZE = 25
const DEBOUNCE_MS = 300

export default function AdminUserManagement() {
  const [tenantId, setTenantId] = useState<string>("")
  const [roleId, setRoleId] = useState<string>("")
  const [status, setStatus] = useState<string>("")
  const [search, setSearch] = useState<string>("")
  const debouncedSearch = useDebounce(search, DEBOUNCE_MS)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [inviteOpen, setInviteOpen] = useState(false)
  const [roleEditorUser, setRoleEditorUser] = useState<AdminUser | null>(null)
  const [deactivateId, setDeactivateId] = useState<string | null>(null)
  const [activateId, setActivateId] = useState<string | null>(null)
  const [resetPasswordId, setResetPasswordId] = useState<string | null>(null)
  const [bulkDeactivateIds, setBulkDeactivateIds] = useState<string[] | null>(null)
  const [bulkResetIds, setBulkResetIds] = useState<string[] | null>(null)

  const params = useMemo<AdminUsersParams>(
    () => ({
      tenantId: tenantId || undefined,
      roleId: roleId || undefined,
      status: status === "ACTIVE" || status === "DEACTIVATED" ? status : undefined,
      q: debouncedSearch || undefined,
      page,
      pageSize,
    }),
    [tenantId, roleId, status, debouncedSearch, page, pageSize]
  )

  const { data: usersData, isLoading } = useAdminUsers(params)
  const { data: tenants = [] } = useAdminTenants()
  const { data: roles = [] } = useAdminRoles()
  const { data: auditData } = useAdminUserAuditTrail({ targetType: "user" })

  const inviteMutation = useAdminUserInvite()
  const handleInviteSubmit = useCallback(
    (values: { email: string; name?: string; tenantRoles: { tenantId: string; roleId: string }[]; ssoEnabled?: boolean; expiresAt?: string; message?: string }) => {
      inviteMutation.mutate(
        {
          email: values.email,
          name: values.name,
          tenantRoles: values.tenantRoles,
          ssoEnabled: values.ssoEnabled,
          expiresAt: values.expiresAt,
          message: values.message,
        },
        {
          onSuccess: () => {
            setInviteOpen(false)
          },
        }
      )
    },
    [inviteMutation]
  )
  const deactivateMutation = useAdminUserDeactivate()
  const reactivateMutation = useAdminUserReactivate()
  const resetMutation = useAdminUserResetPassword()
  const exportMutation = useAdminUserExport()

  const tenantsList = safeArray(tenants)
  const rolesList = safeArray(roles)
  const users = safeArray(usersData?.items)
  const count = usersData?.count ?? 0
  const totalPages = Math.max(1, Math.ceil(count / pageSize))
  const auditItems = safeArray(auditData?.items)

  const clearFilters = useCallback(() => {
    setTenantId("")
    setRoleId("")
    setStatus("")
    setSearch("")
    setPage(1)
  }, [])

  const handleBulkAction = useCallback(
    (action: BulkAction) => {
      if (action === "deactivate" && selectedIds.length > 0) {
        setBulkDeactivateIds(selectedIds)
      } else if (action === "reset-password" && selectedIds.length > 0) {
        setBulkResetIds(selectedIds)
      } else if (action === "export-csv") {
        exportMutation.mutate({ ...params, format: "csv" })
      } else if (action === "export-json") {
        exportMutation.mutate({ ...params, format: "json" })
      }
    },
    [selectedIds, params, exportMutation]
  )

  const onConfirmDeactivate = useCallback(() => {
    if (bulkDeactivateIds && bulkDeactivateIds.length > 0) {
      bulkDeactivateIds.forEach((id) => deactivateMutation.mutate(id))
      setBulkDeactivateIds(null)
      setSelectedIds([])
    } else if (deactivateId) {
      deactivateMutation.mutate(deactivateId, { onSuccess: () => setDeactivateId(null) })
    }
  }, [bulkDeactivateIds, deactivateId, deactivateMutation])

  const onConfirmActivate = useCallback(() => {
    if (activateId) {
      reactivateMutation.mutate(activateId, { onSuccess: () => setActivateId(null) })
    }
  }, [activateId, reactivateMutation])

  const onConfirmResetPassword = useCallback(() => {
    if (bulkResetIds && bulkResetIds.length > 0) {
      bulkResetIds.forEach((id) => resetMutation.mutate(id))
      setBulkResetIds(null)
      setSelectedIds([])
    } else if (resetPasswordId) {
      resetMutation.mutate(resetPasswordId, { onSuccess: () => setResetPasswordId(null) })
    }
  }, [bulkResetIds, resetPasswordId, resetMutation])

  const deactivateIds = bulkDeactivateIds ?? (deactivateId ? [deactivateId] : [])
  const resetIds = bulkResetIds ?? (resetPasswordId ? [resetPasswordId] : [])

  return (
    <DataAccessGuard>
      <AnimatedPage>
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                Admin — User Management
              </h1>
              <p className="text-muted-foreground">
                Manage users across tenants. Invite users, assign roles, and control access.
              </p>
            </div>
            <Button onClick={() => setInviteOpen(true)} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Invite user
            </Button>
          </div>

          {/* Filters */}
          <Card className="card-elevated rounded-[1.25rem] border border-border bg-card shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-lg">Filters</CardTitle>
              <CardDescription>Search and filter users by tenant, role, and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="space-y-2">
                  <Label htmlFor="tenant">Tenant</Label>
                  <Select value={tenantId || "all"} onValueChange={(v) => setTenantId(v === "all" ? "" : v)}>
                    <SelectTrigger id="tenant">
                      <SelectValue placeholder="All tenants" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All tenants</SelectItem>
                      {tenantsList.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={roleId || "all"} onValueChange={(v) => setRoleId(v === "all" ? "" : v)}>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="All roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All roles</SelectItem>
                      {rolesList.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status || "all"} onValueChange={(v) => setStatus(v === "all" ? "" : v)}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="DEACTIVATED">Deactivated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setPage(1)
                    }}
                  />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
                <div className="flex items-center gap-2">
                  <Label htmlFor="pageSize" className="text-sm text-muted-foreground">
                    Per page
                  </Label>
                  <Select
                    value={String(pageSize)}
                    onValueChange={(v) => {
                      setPageSize(Number(v))
                      setPage(1)
                    }}
                  >
                    <SelectTrigger id="pageSize" className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZE_OPTIONS.map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User table + Audit trail */}
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <Card className="card-elevated rounded-[1.25rem] border border-border bg-card shadow-card">
              <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 font-display">
                    <Users className="h-5 w-5 text-primary" />
                    Users
                  </CardTitle>
                  <CardDescription>
                    {count} user(s). Select rows for bulk actions.
                  </CardDescription>
                </div>
                <BulkActionsBar
                  selectedCount={selectedIds.length}
                  onAction={handleBulkAction}
                  isLoading={exportMutation.isPending}
                  isExporting={exportMutation.isPending}
                />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-14 w-full" />
                    ))}
                  </div>
                ) : users.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border py-12 text-center text-muted-foreground">
                    No users match the current filters.
                  </div>
                ) : (
                  <>
                    <UserTable
                      users={users}
                      selectedIds={selectedIds}
                      onSelectionChange={setSelectedIds}
                      onEditRoles={setRoleEditorUser}
                      onDeactivate={(id) => setDeactivateId(id)}
                      onActivate={(id) => setActivateId(id)}
                      onResetPassword={(id) => setResetPasswordId(id)}
                    />
                    {totalPages > 1 && (
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
                        <p className="text-sm text-muted-foreground">
                          Page {page} of {totalPages} · {count} total
                        </p>
                        <div className="flex items-center gap-2" role="navigation" aria-label="Pagination">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            aria-label="Previous page"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                            aria-label="Next page"
                          >
                            Next
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <AuditTrailPanel events={auditItems} />
          </div>
        </div>

        {/* Modals */}
        <InviteUserModal
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          onSubmit={handleInviteSubmit}
          tenants={tenantsList}
          roles={rolesList}
          isLoading={inviteMutation.isPending}
        />

        <RoleAssignmentEditor
          open={!!roleEditorUser}
          onOpenChange={(open) => !open && setRoleEditorUser(null)}
          user={roleEditorUser}
          onSave={() => {
            setRoleEditorUser(null)
          }}
        />

        <ConfirmationDialog
          open={deactivateIds.length > 0}
          onOpenChange={(open) => {
            if (!open) {
              setBulkDeactivateIds(null)
              setDeactivateId(null)
            }
          }}
          title={deactivateIds.length > 1 ? "Deactivate users" : "Deactivate user"}
          description={
            deactivateIds.length > 1
              ? `This will deactivate ${deactivateIds.length} users. They will lose access.`
              : "This user will lose access. You can reactivate them later if needed."
          }
          confirmLabel="Deactivate"
          variant="destructive"
          onConfirm={onConfirmDeactivate}
          isLoading={deactivateMutation.isPending}
        />

        <ConfirmationDialog
          open={!!activateId}
          onOpenChange={(open) => !open && setActivateId(null)}
          title="Activate user"
          description="This user will regain access to the platform."
          confirmLabel="Activate"
          onConfirm={onConfirmActivate}
          isLoading={reactivateMutation.isPending}
        />

        <ConfirmationDialog
          open={resetIds.length > 0}
          onOpenChange={(open) => {
            if (!open) {
              setBulkResetIds(null)
              setResetPasswordId(null)
            }
          }}
          title={resetIds.length > 1 ? "Reset passwords" : "Reset password"}
          description={
            resetIds.length > 1
              ? `A password reset email will be sent to ${resetIds.length} users.`
              : "A password reset email will be sent to this user."
          }
          confirmLabel="Send reset"
          onConfirm={onConfirmResetPassword}
          isLoading={resetMutation.isPending}
        />
      </AnimatedPage>
    </DataAccessGuard>
  )
}
