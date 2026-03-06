import { useState } from "react"
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
import { useVerifyMfa } from "@/hooks/useAuth"
import { ShieldCheck } from "lucide-react"

interface MFAPromptModalProps {
  open: boolean
  onSuccess: () => void
  onCancel?: () => void
}

export function MFAPromptModal({ open, onSuccess, onCancel }: MFAPromptModalProps) {
  const [code, setCode] = useState("")
  const verifyMfa = useVerifyMfa()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code?.trim()) return
    verifyMfa.mutate(
      { code: code.trim() },
      {
        onSuccess: () => {
          setCode("")
          onSuccess()
        },
        onError: () => {
          setCode("")
        },
      }
    )
  }

  const handleCancel = () => {
    setCode("")
    onCancel?.()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleCancel()}>
      <DialogContent showClose={!!onCancel} className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" aria-hidden />
          </div>
          <DialogTitle className="text-center font-display">Two-factor authentication</DialogTitle>
          <DialogDescription className="text-center">
            Enter the verification code from your authenticator app.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mfa-code">Verification code</Label>
            <Input
              id="mfa-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
              disabled={verifyMfa.isPending}
              aria-describedby="mfa-code-hint"
            />
            <p id="mfa-code-hint" className="text-xs text-muted-foreground">
              6-digit code from your authenticator app
            </p>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            {onCancel && (
              <Button type="button" variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={verifyMfa.isPending || code.length < 6} className="w-full sm:w-auto">
              {verifyMfa.isPending ? "Verifying…" : "Verify"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
