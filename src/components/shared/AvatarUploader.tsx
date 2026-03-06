/**
 * Avatar uploader with optimistic UI and progress indicator.
 * Handles null avatar gracefully; validates image type and size.
 */

import { useRef, useState, useCallback } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Camera, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const MAX_SIZE_BYTES = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

function getInitials(name: string, email: string): string {
  const trimmed = (name ?? "").trim()
  if (trimmed) {
    const parts = trimmed.split(/\s+/)
    if (parts.length >= 2) return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase()
    return trimmed.slice(0, 2).toUpperCase()
  }
  return (email ?? "U").slice(0, 2).toUpperCase()
}

export interface AvatarUploaderProps {
  /** Current avatar URL; may be null */
  avatarUrl: string | null
  displayName?: string
  email?: string
  onUpload: (file: File) => Promise<string | null>
  size?: "sm" | "md" | "lg"
  className?: string
  disabled?: boolean
}

const sizeClasses = {
  sm: "h-16 w-16",
  md: "h-20 w-20",
  lg: "h-24 w-24",
}

export function AvatarUploader({
  avatarUrl,
  displayName = "",
  email = "",
  onUpload,
  size = "md",
  className,
  disabled = false,
}: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [optimisticUrl, setOptimisticUrl] = useState<string | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const displayUrl = optimisticUrl ?? avatarUrl ?? undefined

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Please use JPEG, PNG, WebP, or GIF.")
        return
      }
      if (file.size > MAX_SIZE_BYTES) {
        setError("Image must be under 2MB.")
        return
      }

      setError(null)
      setProgress(10)

      try {
        // Simulate progress steps for UX
        const step = () => {
          setProgress((p) => (p == null ? null : Math.min(90, (p ?? 0) + 20)))
        }
        const t1 = setTimeout(step, 100)
        const t2 = setTimeout(step, 300)

        const url = await onUpload(file)
        clearTimeout(t1)
        clearTimeout(t2)
        setProgress(100)
        if (url) {
          setOptimisticUrl(url)
          setTimeout(() => setOptimisticUrl(null), 0)
        }
      } catch {
        setError("Upload failed. Try again.")
        setProgress(null)
      } finally {
        setTimeout(() => setProgress(null), 400)
      }

      if (inputRef.current) inputRef.current.value = ""
    },
    [onUpload]
  )

  const handleClick = () => {
    if (disabled) return
    inputRef.current?.click()
  }

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        className="sr-only"
        onChange={handleFileChange}
        aria-label="Upload avatar"
        disabled={disabled}
      />
      <div className="relative">
        <Avatar
          className={cn(
            "rounded-2xl border-2 border-border transition-all duration-300",
            sizeClasses[size],
            !disabled && "hover:ring-2 hover:ring-primary/50 cursor-pointer"
          )}
          onClick={handleClick}
          role={disabled ? undefined : "button"}
          aria-label={disabled ? undefined : "Change avatar"}
        >
          <AvatarImage src={displayUrl} alt="" />
          <AvatarFallback className="rounded-2xl bg-primary/10 text-lg text-primary">
            {getInitials(displayName, email)}
          </AvatarFallback>
        </Avatar>
        {!disabled && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-2xl bg-foreground/40 opacity-0 transition-opacity hover:opacity-100 focus-within:opacity-100"
            onClick={handleClick}
            onKeyDown={(e) => e.key === "Enter" && handleClick()}
            role="button"
            tabIndex={0}
            aria-label="Upload new avatar"
          >
            {progress != null ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary-foreground" aria-hidden />
            ) : (
              <Camera className="h-8 w-8 text-primary-foreground" aria-hidden />
            )}
          </div>
        )}
      </div>
      {progress != null && (
        <div className="w-full max-w-[140px]">
          <Progress value={progress} className="h-1.5" aria-label="Upload progress" />
        </div>
      )}
      {error && (
        <p className="text-xs text-destructive text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
