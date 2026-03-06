import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAdminTenants, useAdminRoles, useAdminUserUpdateRoles } from "@/hooks/useAdmin"
import { safeArray } from "@/lib/data-guard"
import type { AdminUser } from "@/types/admin"
import { cn } from "@/lib/utils"

const roleSchema = z.object({
  tenantRoles: z
    .array(
      z.object({
        tenantId: z.string().min(1, "Tenant required"),
        roleId: z.string().min(1, "Role required"),
      })
    )
    .min(1, "At least one tenant with role is required"),
})

type RoleFormValues = z.infer<typeof roleSchema>

interface RoleAssignmentEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: AdminUser | null
  onSave?: (tenantRoles: { tenantId: string; roleId: string }[]) => void
}

export function RoleAssignmentEditor({
  open,
  onOpenChange,
  user,
  onSave,
}: RoleAssignmentEditorProps) {
  const { data: tenants = [] } = useAdminTenants()
  const { data: roles = [] } = useAdminRoles()
  const updateRolesMutation = useAdminUserUpdateRoles()

  const tenantsList = safeArray(tenants)
  const rolesList = safeArray(roles)

  const getTenantId = (t: { id?: string; tenantId?: string }) => t.tenantId ?? t.id ?? ""
  const existingTenantRoles = (user?.tenants ?? [])
    .map((t) => {
      const firstRoleName = (user?.roles ?? [])[0]
      const roleId = rolesList.find((r) => r.name === firstRoleName)?.id ?? rolesList[0]?.id ?? ""
      return { tenantId: getTenantId(t as { id?: string; tenantId?: string }), roleId }
    })
    .filter((tr) => tr.tenantId)

  const defaultTenantRoles =
    existingTenantRoles.length > 0
      ? existingTenantRoles
      : tenantsList.length > 0 && rolesList.length > 0
        ? [{ tenantId: tenantsList[0].id, roleId: rolesList[0].id }]
        : []

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: { tenantRoles: defaultTenantRoles },
  })

  useEffect(() => {
    if (open && user) {
      const getTid = (t: { id?: string; tenantId?: string }) => t.tenantId ?? t.id ?? ""
      const initial = (user.tenants ?? [])
        .map((t) => {
          const firstRoleName = (user.roles ?? [])[0]
          const roleId = rolesList.find((r) => r.name === firstRoleName)?.id ?? rolesList[0]?.id ?? ""
          return { tenantId: getTid(t as { id?: string; tenantId?: string }), roleId }
        })
        .filter((tr) => tr.tenantId)
      reset({
        tenantRoles:
          initial.length > 0
            ? initial
            : tenantsList.length > 0 && rolesList.length > 0
              ? [{ tenantId: tenantsList[0]?.id ?? "", roleId: rolesList[0]?.id ?? "" }]
              : [],
      })
    }
  }, [open, user?.id, tenantsList, rolesList])

  const tenantRoles = watch("tenantRoles") ?? []

  const addTenantRole = () => {
    if (tenantsList.length > 0 && rolesList.length > 0) {
      setValue("tenantRoles", [
        ...tenantRoles,
        { tenantId: tenantsList[0].id, roleId: rolesList[0].id },
      ])
    }
  }

  const removeTenantRole = (index: number) => {
    const next = tenantRoles.filter((_, i) => i !== index)
    setValue("tenantRoles", next)
  }

  const updateTenantRole = (index: number, field: "tenantId" | "roleId", value: string) => {
    const next = [...tenantRoles]
    next[index] = { ...next[index], [field]: value }
    setValue("tenantRoles", next)
  }

  const onSubmit = (values: RoleFormValues) => {
    const validRoles = (values.tenantRoles ?? []).filter(
      (tr) => tr.tenantId && tr.roleId
    )
    if (user?.id && validRoles.length > 0) {
      updateRolesMutation.mutate(
        { userId: user.id, tenantRoles: validRoles },
        {
          onSuccess: () => {
            onSave?.(values.tenantRoles)
            reset()
            onOpenChange(false)
          },
        }
      )
    } else {
      onSave?.(values.tenantRoles)
      reset()
      onOpenChange(false)
    }
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit roles</DialogTitle>
          <DialogDescription>
            {user ? `Assign roles for ${user.email} across tenants.` : "Assign roles per tenant."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Role(s) per tenant</Label>
                <Button type="button" variant="outline" size="sm" onClick={addTenantRole}>
                  Add tenant
                </Button>
              </div>
              {(tenantRoles ?? []).map((tr, i) => (
                <div key={i} className="flex gap-2">
                  <Select
                    value={tr.tenantId}
                    onValueChange={(v) => updateTenantRole(i, "tenantId", v)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Tenant" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenantsList.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={tr.roleId}
                    onValueChange={(v) => updateTenantRole(i, "roleId", v)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      {rolesList.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTenantRole(i)}
                    aria-label="Remove tenant role"
                    className={cn(tenantRoles.length <= 1 && "invisible")}
                  >
                    ×
                  </Button>
                </div>
              ))}
              {errors.tenantRoles && (
                <p className="text-sm text-destructive">{errors.tenantRoles.message}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateRolesMutation.isPending}>
              {updateRolesMutation.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
