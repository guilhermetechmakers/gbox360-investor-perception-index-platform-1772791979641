import { useState } from "react"
import { Button } from "@/components/ui/button"
import { authApi } from "@/api/auth"
import { toast } from "sonner"
import { Loader2, Building2 } from "lucide-react"

export function SSOLoginButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSSO = async () => {
    setIsLoading(true)
    try {
      const result = await authApi.initiateSSO()
      if (result?.url) {
        window.location.href = result.url
      } else {
        toast.info("Enterprise SSO coming soon. Contact your administrator or sales for setup.")
      }
    } catch {
      toast.info("Enterprise SSO coming soon. Contact your administrator or sales for setup.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleSSO}
      disabled={isLoading}
      aria-label="Sign in with SSO"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        <Building2 className="h-4 w-4" aria-hidden />
      )}
      <span>Sign in with SSO (Enterprise)</span>
    </Button>
  )
}
