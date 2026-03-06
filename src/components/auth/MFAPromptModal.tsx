import { useState, useEffect } from "react"
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
import { InlineErrorBox } from "@/components/auth/InlineErrorBox"
import { toast } from "sonner"
import { ShieldCheck, Loader2 } from "lucide-react"

interface MFAPromptModalProps {
  open: boolean
  onSuccess: () => void
  onCancel?: () => void
}

export function MFAPromptModal({ open, onSuccess, onCancel }: MFAPromptModalProps) {
  const [code, setCode] = useState("")
  const [mfaError, setMfaError] = useState("")
  const verifyMfa = useVerifyMfa()

  useEffect(() => {
    if (!open) {
      setCode("")
      setMfaError("")
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code?.trim()) return
    setMfaError("")
    verifyMfa.mutate(
      { code: code.trim() },
      {
        onSuccess: () => {
          setCode("")
          setMfaError("")
          onSuccess()
        },
        onError: (err: Error) => {
          setCode("")
          setMfaError(err?.message ?? "Verification failed. Please try again.")
        },
      }
    )
  }

  const handleResendMfa = () => {
    setMfaError("")
    toast.info("Resend MFA code is not yet available. Use your authenticator app for a new code.")
  }

  const handleCancel = () => {
    setCode("")
    setMfaError("")
    onCancel?.()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleCancel()}>
      <DialogContent showClose={!!onCancel} className="sm:max-w-md rounded-[18px] shadow-card">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" aria-hidden />
          </div>
          <DialogTitle className="text-center font-display text-xl">Two-factor authentication</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Enter the verification code from your authenticator app.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InlineErrorBox message={mfaError} />
          <div className="space-y-2">
            <Label htmlFor="mfa-code">Verification code</Label>
            <Input
              id="mfa-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                if (mfaError) setMfaError("")
              }}
              maxLength={6}
              disabled={verifyMfa.isPending}
              aria-describedby="mfa-code-hint"
              className="rounded-lg focus-visible:ring-ring"
            />
            <p id="mfa-code-hint" className="text-xs text-muted-foreground">
              6-digit code from your authenticator app
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleResendMfa}
              className="text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
              aria-label="Resend MFA code"
            >
              Resend code
            </button>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row pt-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={handleCancel} className="w-full sm:w-auto rounded-lg">
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={verifyMfa.isPending || code.length < 6}
              className="w-full sm:w-auto rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {verifyMfa.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Verifying…
                </>
              ) : (
                "Verify"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
