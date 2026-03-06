import { useState } from "react"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Key, Plus, Copy, Eye, EyeOff, RotateCcw, Trash2 } from "lucide-react"
import { useSettings, useSettingsApiKeyCreate, useSettingsApiKeyRotate, useSettingsApiKeyRevoke } from "@/hooks/useSettings"
import { ConfirmationDialog } from "@/components/admin/user-management"
import type { ApiKey } from "@/types/settings"
import { safeArray } from "@/lib/data-guard"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const createKeySchema = z.object({
  label: z.string().min(1, "Label is required"),
})

type CreateKeyFormValues = z.infer<typeof createKeySchema>

function maskSecret(s: string): string {
  if (!s || s.length < 8) return "••••••••"
  return s.slice(0, 8) + "••••••••••••••••••••••••••••••••••••"
}

function copyToClipboard(text: string): boolean {
  try {
    navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export function ApiKeysPanel() {
  const { data, isLoading } = useSettings()
  const createMutation = useSettingsApiKeyCreate()
  const rotateMutation = useSettingsApiKeyRotate()
  const revokeMutation = useSettingsApiKeyRevoke()

  const apiKeys = safeArray(data?.apiKeys) as ApiKey[]
  const [createOpen, setCreateOpen] = useState(false)
  const [revealedId, setRevealedId] = useState<string | null>(null)
  const [ephemeralSecret, setEphemeralSecret] = useState<Record<string, string>>({})
  const [revokeId, setRevokeId] = useState<string | null>(null)
  const [rotateId, setRotateId] = useState<string | null>(null)

  const form = useForm<CreateKeyFormValues>({
    resolver: zodResolver(createKeySchema),
    defaultValues: { label: "" },
  })

  const handleCreate = (values: CreateKeyFormValues) => {
    createMutation.mutate(
      { label: values.label },
      {
        onSuccess: (res) => {
          if (res?.secret) {
            setEphemeralSecret((prev) => ({ ...prev, [res.id]: res.secret! }))
            setRevealedId(res.id)
          }
          form.reset()
          setCreateOpen(false)
        },
      }
    )
  }

  const handleRotate = (id: string) => {
    setRotateId(id)
  }

  const onConfirmRotate = () => {
    if (!rotateId) return
    rotateMutation.mutate(rotateId, {
      onSuccess: (res) => {
        if (res?.secret) {
          setEphemeralSecret((prev) => ({ ...prev, [rotateId]: res.secret }))
          setRevealedId(rotateId)
        }
        setRotateId(null)
      },
    })
  }

  const handleRevoke = (id: string) => setRevokeId(id)
  const onConfirmRevoke = () => {
    if (revokeId) {
      revokeMutation.mutate(revokeId, { onSuccess: () => setRevokeId(null) })
    }
  }

  const handleCopy = (_id: string, secret: string) => {
    if (copyToClipboard(secret)) {
      toast.success("Copied to clipboard")
    } else {
      toast.error("Failed to copy")
    }
  }

  const handleReveal = (id: string) => {
    setRevealedId((prev) => (prev === id ? null : id))
  }

  const getDisplayKey = (key: ApiKey): string => {
    const secret = ephemeralSecret[key.id]
    if (secret) return revealedId === key.id ? secret : maskSecret(secret)
    return key.maskedKey
  }

  const canReveal = (key: ApiKey): boolean => !!ephemeralSecret[key.id]

  if (isLoading) {
    return (
      <Card className="card-elevated rounded-[1.25rem] border border-border bg-card shadow-card">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-elevated rounded-[1.25rem] border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2 font-display">
            <Key className="h-5 w-5 text-primary" />
            API Keys & Integrations
          </CardTitle>
          <CardDescription>
            Generate, rotate, and revoke API keys for enterprise connectors. Keys are masked by default.
          </CardDescription>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Create key
        </Button>
      </CardHeader>
      <CardContent>
        {apiKeys.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-12 px-6 text-center">
            <Key className="h-10 w-10 text-muted-foreground" aria-hidden />
            <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
              No API keys yet
            </h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Create an API key to integrate with external systems, webhooks, or data ingestion.
            </p>
            <Button className="mt-6" onClick={() => setCreateOpen(true)}>
              Create API key
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {(apiKeys ?? []).map((key) => (
              <div
                key={key.id}
                className="flex flex-col gap-2 rounded-lg border border-border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{key.label}</p>
                    <p className="font-mono text-sm text-muted-foreground">
                      {getDisplayKey(key)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {canReveal(key) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleReveal(key.id)}
                        aria-label={revealedId === key.id ? "Hide key" : "Reveal key"}
                      >
                        {revealedId === key.id ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    {ephemeralSecret[key.id] && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(key.id, ephemeralSecret[key.id]!)}
                        aria-label="Copy key"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRotate(key.id)}
                      disabled={rotateMutation.isPending}
                      aria-label="Rotate key"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRevoke(key.id)}
                      className="text-destructive hover:text-destructive"
                      aria-label="Revoke key"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Created {new Date(key.createdAt).toLocaleDateString()}</span>
                  {key.lastUsed && (
                    <span>Last used {new Date(key.lastUsed).toLocaleDateString()}</span>
                  )}
                  {key.scopes && key.scopes.length > 0 && (
                    <span>Scopes: {key.scopes.join(", ")}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Create key modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create API key</DialogTitle>
            <DialogDescription>
              Enter a label for this key. The secret will be shown once — copy it immediately.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleCreate)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="api-key-label">Label</Label>
                <Input
                  id="api-key-label"
                  placeholder="e.g. Production API"
                  {...form.register("label")}
                  className={cn(form.formState.errors.label && "border-destructive")}
                />
                {form.formState.errors.label && (
                  <p className="text-sm text-destructive">{form.formState.errors.label.message}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating…" : "Create key"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={!!revokeId}
        onOpenChange={(open) => !open && setRevokeId(null)}
        title="Revoke API key"
        description="This key will stop working immediately. You cannot undo this action."
        confirmLabel="Revoke"
        variant="destructive"
        onConfirm={onConfirmRevoke}
        isLoading={revokeMutation.isPending}
      />

      <ConfirmationDialog
        open={!!rotateId}
        onOpenChange={(open) => !open && setRotateId(null)}
        title="Rotate API key"
        description="A new secret will be generated. The old key will stop working. Copy the new secret now."
        confirmLabel="Rotate"
        onConfirm={onConfirmRotate}
        isLoading={rotateMutation.isPending}
      />
    </Card>
  )
}
