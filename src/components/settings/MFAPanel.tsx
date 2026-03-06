import { useState } from "react"
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
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Shield, Loader2, Smartphone, CheckCircle } from "lucide-react"
import { useCurrentUser } from "@/hooks/useAuth"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { authApi } from "@/api/auth"
import { authKeys } from "@/hooks/useAuth"
import { toast } from "sonner"
import { InlineErrorBox } from "@/components/auth/InlineErrorBox"

export function MFAPanel() {
  const { user } = useCurrentUser()
  const queryClient = useQueryClient()
  const mfaEnabled = user?.mfa_enabled === true

  const [setupOpen, setSetupOpen] = useState(false)
  const [disableOpen, setDisableOpen] = useState(false)
  const [setupStep, setSetupStep] = useState<"qr" | "verify">("qr")
  const [setupData, setSetupData] = useState<{ secret?: string; provisioning_uri?: string; qr_code_url?: string } | null>(null)
  const [verifyCode, setVerifyCode] = useState("")
  const [disableCode, setDisableCode] = useState("")
  const [error, setError] = useState("")

  const setupMutation = useMutation({
    mutationFn: () => authApi.mfaSetup(),
    onSuccess: (data) => {
      setSetupData(data ?? null)
      setSetupStep("verify")
      setError("")
    },
    onError: (err: Error) => {
      setError(err?.message ?? "Failed to start MFA setup")
    },
  })

  const verifyMutation = useMutation({
    mutationFn: (code: string) => authApi.mfaVerifyEnroll(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.me })
      setSetupOpen(false)
      setSetupData(null)
      setVerifyCode("")
      setSetupStep("qr")
      toast.success("Two-factor authentication enabled")
    },
    onError: (err: Error) => {
      setError(err?.message ?? "Verification failed. Please try again.")
    },
  })

  const disableMutation = useMutation({
    mutationFn: (code: string) => authApi.mfaDisable(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.me })
      setDisableOpen(false)
      setDisableCode("")
      toast.success("Two-factor authentication disabled")
    },
    onError: (err: Error) => {
      setError(err?.message ?? "Failed to disable MFA")
    },
  })

  const handleStartSetup = () => {
    setError("")
    setSetupStep("qr")
    setSetupData(null)
    setVerifyCode("")
    setSetupOpen(true)
    setupMutation.mutate()
  }

  const handleVerifySetup = (e: React.FormEvent) => {
    e.preventDefault()
    if (!verifyCode?.trim() || verifyCode.length < 6) return
    setError("")
    verifyMutation.mutate(verifyCode.trim())
  }

  const handleDisable = (e: React.FormEvent) => {
    e.preventDefault()
    if (!disableCode?.trim() || disableCode.length < 6) return
    setError("")
    disableMutation.mutate(disableCode.trim())
  }

  const handleCloseSetup = () => {
    setSetupOpen(false)
    setSetupData(null)
    setSetupStep("qr")
    setVerifyCode("")
    setError("")
  }

  const handleCloseDisable = () => {
    setDisableOpen(false)
    setDisableCode("")
    setError("")
  }

  return (
    <Card className="card-elevated rounded-[1.25rem] border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display">
          <Shield className="h-5 w-5 text-primary" />
          Two-factor authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security by requiring a verification code from your authenticator app when signing in.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-muted p-2">
                <Smartphone className="h-5 w-5 text-muted-foreground" aria-hidden />
              </div>
              <div>
                <p className="font-medium">Status</p>
                <p className="text-sm text-muted-foreground">
                  {mfaEnabled ? (
                    <span className="inline-flex items-center gap-1.5 text-primary">
                      <CheckCircle className="h-4 w-4" />
                      Enabled
                    </span>
                  ) : (
                    "Not enabled"
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {mfaEnabled ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDisableOpen(true)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  Disable MFA
                </Button>
              ) : (
                <Button size="sm" onClick={handleStartSetup} disabled={setupMutation.isPending}>
                  {setupMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Setting up…
                    </>
                  ) : (
                    "Enable MFA"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      {/* Setup dialog */}
      <Dialog open={setupOpen} onOpenChange={(o) => !o && handleCloseSetup()}>
        <DialogContent className="sm:max-w-md rounded-[18px] shadow-card">
          <DialogHeader>
            <DialogTitle className="font-display">Set up two-factor authentication</DialogTitle>
            <DialogDescription>
              {setupStep === "qr"
                ? "Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)."
                : "Enter the 6-digit code from your authenticator app to verify setup."}
            </DialogDescription>
          </DialogHeader>
          <InlineErrorBox message={error} />
          {setupStep === "qr" && setupMutation.isPending && (
            <div className="flex flex-col items-center gap-4 py-6">
              <Skeleton className="h-40 w-40 rounded-lg" />
              <p className="text-sm text-muted-foreground">Generating QR code…</p>
            </div>
          )}
          {setupStep === "qr" && setupData && !setupMutation.isPending && (
            <div className="flex flex-col items-center gap-4 py-4">
              {setupData.qr_code_url ? (
                <img
                  src={setupData.qr_code_url}
                  alt="QR code for authenticator app"
                  className="h-40 w-40 rounded-lg border border-border"
                />
              ) : (
                <div className="rounded-lg border border-border bg-muted/30 p-4 font-mono text-sm break-all max-w-full">
                  {setupData.secret ?? "Manual entry not available"}
                </div>
              )}
              <p className="text-xs text-muted-foreground text-center">
                Add this account to your authenticator app, then click Continue.
              </p>
            </div>
          )}
          {setupStep === "verify" && (
            <form onSubmit={handleVerifySetup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mfa-setup-code">Verification code</Label>
                <Input
                  id="mfa-setup-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  value={verifyCode}
                  onChange={(e) => {
                    setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    if (error) setError("")
                  }}
                  maxLength={6}
                  disabled={verifyMutation.isPending}
                  className="rounded-lg"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseSetup}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={verifyMutation.isPending || verifyCode.length < 6}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {verifyMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying…
                    </>
                  ) : (
                    "Verify and enable"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
          {setupStep === "qr" && setupData && !setupMutation.isPending && (
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseSetup}>
                Cancel
              </Button>
              <Button onClick={() => setSetupStep("verify")}>Continue</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Disable dialog */}
      <AlertDialog open={disableOpen} onOpenChange={(o) => !o && handleCloseDisable()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable two-factor authentication</AlertDialogTitle>
            <AlertDialogDescription>
              Enter your current authenticator code to confirm. This will make your account less secure.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form onSubmit={handleDisable} className="space-y-4">
            <InlineErrorBox message={error} />
            <div className="space-y-2">
              <Label htmlFor="mfa-disable-code">Verification code</Label>
              <Input
                id="mfa-disable-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                value={disableCode}
                onChange={(e) => {
                  setDisableCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  if (error) setError("")
                }}
                maxLength={6}
                disabled={disableMutation.isPending}
                className="rounded-lg"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel type="button" onClick={handleCloseDisable}>
                Cancel
              </AlertDialogCancel>
              <Button
                type="submit"
                variant="destructive"
                disabled={disableMutation.isPending || disableCode.length < 6}
              >
                {disableMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Disabling…
                  </>
                ) : (
                  "Disable MFA"
                )}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
