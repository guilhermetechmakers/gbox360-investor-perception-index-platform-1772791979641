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
import { Users, UserPlus } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface TeamSeatsPanelProps {
  seatsActive: number
  seatsTotal: number
  members?: { id: string; email: string; role: string }[]
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function TeamSeatsPanel({
  seatsActive,
  seatsTotal,
  members = [],
}: TeamSeatsPanelProps) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"admin" | "user">("user")
  const [emailError, setEmailError] = useState<string | null>(null)

  const safeMembers = Array.isArray(members) ? members : []
  const total = Math.max(0, seatsTotal)
  const active = Math.max(0, Math.min(seatsActive, total))

  const handleInvite = () => {
    setEmailError(null)
    const trimmed = email.trim()
    if (!trimmed) {
      setEmailError("Email is required")
      return
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setEmailError("Enter a valid email address")
      return
    }
    if (active >= total && total > 0) {
      toast.error("No seats available. Upgrade your plan to add more.")
      return
    }
    toast.success("Invite sent (demo). Connect API to send real invites.")
    setEmail("")
  }

  return (
    <Card className="card-elevated rounded-[1rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Users className="h-5 w-5" />
          Team seats
        </CardTitle>
        <CardDescription>
          {total === 0
            ? "Add seats via plan upgrade."
            : `${active} of ${total} seats in use.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {total > 0 && (
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px] space-y-2">
              <Label htmlFor="invite-email">Invite by email</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setEmailError(null)
                }}
                onBlur={() => {
                  if (email.trim() && !EMAIL_REGEX.test(email.trim()))
                    setEmailError("Enter a valid email address")
                }}
                aria-invalid={!!emailError}
                aria-describedby={emailError ? "invite-email-error" : undefined}
              />
              {emailError && (
                <p id="invite-email-error" className="text-sm text-destructive">
                  {emailError}
                </p>
              )}
            </div>
            <Select value={role} onValueChange={(v) => setRole(v as "admin" | "user")}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleInvite}
              disabled={active >= total}
              aria-label="Send invite"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Invite
            </Button>
          </div>
        )}
        {safeMembers.length > 0 ? (
          <ul className="space-y-2">
            {safeMembers.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
              >
                <span>{m.email}</span>
                <span className="text-muted-foreground capitalize">{m.role}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            No team members listed. Invite users above or connect your API.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
