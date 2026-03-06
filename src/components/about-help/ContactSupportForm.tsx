import { useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { createSupportTicket } from "@/api/support"
import type { TicketPayload, TicketUrgency } from "@/types/about-help"
import { cn } from "@/lib/utils"

const schema = z.object({
  subject: z
    .string()
    .min(3, "Subject must be at least 3 characters")
    .max(200, "Subject must be at most 200 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be at most 2000 characters"),
  urgency: z.enum(["Low", "Medium", "High"]),
})

type FormValues = z.infer<typeof schema>

interface ContactSupportFormProps {
  onSubmit?: (payload: TicketPayload) => void | Promise<void>
  onSuccess?: (ticketId: string) => void
  className?: string
}

const URGENCY_OPTIONS: { value: TicketUrgency; label: string }[] = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
]

export function ContactSupportForm({
  onSubmit,
  onSuccess,
  className,
}: ContactSupportFormProps) {
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle")
  const [ticketId, setTicketId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      subject: "",
      description: "",
      urgency: "Medium",
    },
  })

  const urgencyValue = watch("urgency")

  const handleFormSubmit = useCallback(
    async (values: FormValues) => {
      setSubmitStatus("loading")

      const payload: TicketPayload = {
        subject: values.subject,
        description: values.description,
        urgency: values.urgency as TicketUrgency,
      }

      try {
        await onSubmit?.(payload)
        const response = await createSupportTicket(payload)

        if (response.status === "received") {
          setTicketId(response.id)
          setSubmitStatus("success")
          toast.success("Support ticket submitted", {
            description: `Ticket #${response.id} has been received.`,
          })
          onSuccess?.(response.id)
          reset()
        } else {
          setSubmitStatus("error")
          toast.error("Failed to submit ticket", {
            description: "Please try again or contact support directly.",
          })
        }
      } catch {
        setSubmitStatus("error")
        toast.error("Failed to submit ticket", {
          description: "Please try again or contact support directly.",
        })
      }
    },
    [onSubmit, onSuccess, reset]
  )

  return (
    <Card
      className={cn(
        "rounded-[1rem] border border-border bg-card shadow-card transition-all duration-300 hover:shadow-lg",
        className
      )}
    >
      <CardHeader>
        <CardTitle className="font-display text-2xl font-semibold text-foreground">
          Contact Support
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Submit an inquiry or support ticket. We typically respond within 24
          hours.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {submitStatus === "success" && ticketId && (
          <Alert
            className="border-primary/30 bg-primary/5"
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" aria-hidden />
            <AlertDescription>
              Your ticket has been received. Reference ID:{" "}
              <strong>{ticketId}</strong>. You can{" "}
              <a
                href="#faq"
                className="font-medium text-primary underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById("faq")?.scrollIntoView({
                    behavior: "smooth",
                  })
                }}
              >
                view the FAQ
              </a>{" "}
              while you wait.
            </AlertDescription>
          </Alert>
        )}

        {submitStatus === "error" && (
          <Alert variant="destructive" role="alert" aria-live="assertive">
            <AlertCircle className="h-4 w-4" aria-hidden />
            <AlertDescription>
              Something went wrong. Please try again or email support directly.
            </AlertDescription>
          </Alert>
        )}

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-6"
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="subject">
              Subject <span className="text-destructive">*</span>
            </Label>
            <Input
              id="subject"
              placeholder="Brief summary of your inquiry"
              {...register("subject")}
              className={cn(errors.subject && "border-destructive")}
              aria-invalid={!!errors.subject}
              aria-describedby={errors.subject ? "subject-error" : undefined}
              disabled={submitStatus === "loading"}
            />
            {errors.subject && (
              <p
                id="subject-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {errors.subject.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Provide details about your inquiry or issue..."
              rows={5}
              maxLength={2000}
              {...register("description")}
              className={cn(errors.description && "border-destructive")}
              aria-invalid={!!errors.description}
              aria-describedby={
                errors.description ? "description-error" : "description-count"
              }
              disabled={submitStatus === "loading"}
            />
            <div className="flex justify-between">
              {errors.description ? (
                <p
                  id="description-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {errors.description.message}
                </p>
              ) : (
                <span id="description-count" className="text-sm text-muted-foreground" aria-live="polite">
                  {watch("description").length} / 2000 characters
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="urgency">
              Urgency <span className="text-destructive">*</span>
            </Label>
            <Select
              value={urgencyValue}
              onValueChange={(v) => setValue("urgency", v as TicketUrgency)}
              disabled={submitStatus === "loading"}
            >
              <SelectTrigger id="urgency" aria-label="Select urgency level">
                <SelectValue placeholder="Select urgency" />
              </SelectTrigger>
              <SelectContent>
                {URGENCY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={submitStatus === "loading"}
            className="w-full sm:w-auto"
          >
            {submitStatus === "loading" ? "Submitting..." : "Submit ticket"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
