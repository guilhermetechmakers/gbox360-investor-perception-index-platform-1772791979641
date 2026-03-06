import { useForm } from "react-hook-form"
import { useEffect } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { AdminRole, Tenant, TenantRoleAssignment } from "@/types/admin"
import { addDays, format } from "date-fns"
import { useAdminTenants, useAdminRoles, useAdminUserInvite } from "@/hooks/useAdmin"
import { safeArray } from "@/lib/data-guard"

const inviteSchema = z
  .object({
    email: z.string().min(1, "Email required").email("Invalid email"),
    name: z.string().optional(),
    tenantRoles: z.array(
      z.object({
        tenantId: z.string(),
        roleId: z.string(),
      })
    ),
    ssoEnabled: z.boolean().optional(),
    expiresAt: z.string().optional(),
    message: z.string().optional(),
  })
  .refine(
    (data) => {
      const valid = (data.tenantRoles ?? []).filter((tr) => tr.tenantId && tr.roleId)
      return valid.length >= 1
    },
    { message: "At least one tenant with role is required", path: ["tenantRoles"] }
  )
  .refine(
    (data) => {
      if (!data.expiresAt) return true
      return new Date(data.expiresAt) > new Date()
    },
    { message: "Expiry must be in the future", path: ["expiresAt"] }
  )

export type InviteFormValues = z.infer<typeof inviteSchema>

interface InviteUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (values: InviteFormValues) => void
  isLoading?: boolean
  tenants?: Tenant[]
  roles?: AdminRole[]
}

const DEFAULT_EXPIRY_DAYS = 7

export function InviteUserModal({
  open,
  onOpenChange,
  onSubmit: onSubmitProp,
  isLoading: isLoadingProp,
  tenants: tenantsProp,
  roles: rolesProp,
}: InviteUserModalProps) {
  const { data: tenantsData = [] } = useAdminTenants()
  const { data: rolesData = [] } = useAdminRoles()
  const inviteMutation = useAdminUserInvite()

  const tenants = tenantsProp ?? safeArray(tenantsData)
  const roles = rolesProp ?? safeArray(rolesData)
  const isLoading = isLoadingProp ?? inviteMutation.isPending
  const handleInviteSubmit = (values: InviteFormValues) => {
    const validRoles = values.tenantRoles.filter(
      (tr) => tr.tenantId && tr.roleId
    ) as TenantRoleAssignment[]
    if (validRoles.length === 0) return
    const input = {
      email: values.email,
      name: values.name,
      tenantRoles: validRoles,
      ssoEnabled: values.ssoEnabled,
      expiresAt: values.expiresAt,
      message: values.message,
    }
    if (onSubmitProp) {
      onSubmitProp(values)
      reset()
      onOpenChange(false)
    } else {
      inviteMutation.mutate(input, {
        onSuccess: () => {
          reset()
          onOpenChange(false)
        },
      })
    }
  }
  const defaultExpiry = format(addDays(new Date(), DEFAULT_EXPIRY_DAYS), "yyyy-MM-dd")

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      name: "",
      tenantRoles: [{ tenantId: "", roleId: "" }],
      ssoEnabled: false,
      expiresAt: defaultExpiry,
      message: "",
    },
  })

  const tenantRoles = watch("tenantRoles") ?? []
  const ssoEnabled = watch("ssoEnabled")

  useEffect(() => {
    if (open) {
      const defaultExpiry = format(addDays(new Date(), DEFAULT_EXPIRY_DAYS), "yyyy-MM-dd")
      reset({
        email: "",
        name: "",
        tenantRoles: [{ tenantId: "", roleId: "" }],
        ssoEnabled: false,
        expiresAt: defaultExpiry,
        message: "",
      })
    }
  }, [open, reset])

  const addTenantRole = () => {
    setValue("tenantRoles", [...tenantRoles, { tenantId: "", roleId: "" }])
  }

  const removeTenantRole = (index: number) => {
    if (tenantRoles.length <= 1) return
    setValue(
      "tenantRoles",
      tenantRoles.filter((_, i) => i !== index)
    )
  }

  const handleFormSubmit = (values: InviteFormValues) => {
    handleInviteSubmit(values)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invite new user</DialogTitle>
          <DialogDescription>
            Send an invitation with per-tenant role assignments. The user will receive an email to
            complete registration.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email *</Label>
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
              <Label>Tenant & role assignments *</Label>
              <p className="text-xs text-muted-foreground">
                Assign at least one tenant with a role
              </p>
              <div className="space-y-2">
                {(tenantRoles ?? []).map((_, index) => (
                  <div key={index} className="flex gap-2">
                    <Select
                      value={tenantRoles[index]?.tenantId || ""}
                      onValueChange={(v) => {
                        const next = [...tenantRoles]
                        next[index] = { ...next[index], tenantId: v, roleId: next[index]?.roleId ?? "" }
                        setValue("tenantRoles", next)
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select tenant" />
                      </SelectTrigger>
                      <SelectContent>
                        {tenants.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={tenantRoles[index]?.roleId || ""}
                      onValueChange={(v) => {
                        const next = [...tenantRoles]
                        next[index] = { ...next[index], roleId: v, tenantId: next[index]?.tenantId ?? "" }
                        setValue("tenantRoles", next)
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((r) => (
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
                      onClick={() => removeTenantRole(index)}
                      disabled={tenantRoles.length <= 1}
                      aria-label="Remove tenant role"
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addTenantRole}>
                  + Add tenant
                </Button>
              </div>
              {errors.tenantRoles && (
                <p className="text-sm text-destructive">{errors.tenantRoles.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="invite-sso">SSO enabled</Label>
              <Switch
                id="invite-sso"
                checked={ssoEnabled}
                onCheckedChange={(v) => setValue("ssoEnabled", v)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-expires">Expiration date</Label>
              <Input
                id="invite-expires"
                type="date"
                {...register("expiresAt")}
              />
              {errors.expiresAt && (
                <p className="text-sm text-destructive">{errors.expiresAt.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-message">Message (optional)</Label>
              <Input
                id="invite-message"
                placeholder="Personal message for the invitee"
                {...register("message")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Sending…" : "Send invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
