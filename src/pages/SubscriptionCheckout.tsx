import { useState, useCallback, useEffect } from "react"
import { Link } from "react-router-dom"
import { AnimatedPage } from "@/components/AnimatedPage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  PlanSummaryPanel,
  PaymentForm,
  BillingDetailsForm,
  EnterpriseInvoiceSection,
  PromoCodeSection,
  SubtotalSummary,
  TermsAndSubmit,
  ConfirmationPanel,
  SubscriptionManagementLinkBlock,
} from "@/components/checkout"
import {
  useSubscription,
  usePlans,
  useApplyPromo,
  useCreateSubscription,
} from "@/hooks/useSubscription"
import { safeArray } from "@/lib/data-guard"
import {
  isValidEmail,
  isNotEmpty,
  isValidVAT,
  isValidCardNumber,
  isValidExpiry,
  isValidCvc,
} from "@/lib/checkout-validation"
import { ArrowLeft, Receipt } from "lucide-react"
import { toast } from "sonner"
import type { Plan, CardFields, BillingDetails, InvoiceDetails } from "@/types/subscription"

const DEFAULT_CARD: CardFields = {
  cardNumber: "",
  expiry: "",
  cvc: "",
  nameOnCard: "",
}

const DEFAULT_BILLING: BillingDetails = {
  contactName: "",
  email: "",
  companyName: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  country: "",
  taxId: "",
}

const DEFAULT_INVOICE: InvoiceDetails = {
  recipientName: "",
  companyName: "",
  billingAddress: "",
  poNumber: "",
  paymentTerms: "",
}

export default function SubscriptionCheckout() {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly")
  const [promoCode, setPromoCode] = useState("")
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string
    discount: number
    newTotal: number
    message: string
  } | null>(null)
  const [promoError, setPromoError] = useState<string | null>(null)
  const [enterpriseInvoiceEnabled, setEnterpriseInvoiceEnabled] = useState(false)
  const [cardFields, setCardFields] = useState<CardFields>(DEFAULT_CARD)
  const [billingDetails, setBillingDetails] = useState<BillingDetails>(DEFAULT_BILLING)
  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetails>(DEFAULT_INVOICE)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [cardErrors, setCardErrors] = useState<Partial<Record<keyof CardFields, string>>>({})
  const [billingErrors, setBillingErrors] = useState<Partial<Record<keyof BillingDetails, string>>>({})
  const [invoiceErrors, setInvoiceErrors] = useState<Partial<Record<keyof InvoiceDetails, string>>>({})
  const [success, setSuccess] = useState<{
    subscriptionId: string
    invoiceId?: string
    pdfUrl?: string
    planName: string
  } | null>(null)

  useSubscription()
  const { data: plans = [], isLoading: plansLoading } = usePlans()
  const applyPromo = useApplyPromo()
  const createSubscription = useCreateSubscription()

  const planList = safeArray(plans)
  const selectedPlan = planList.find((p) => p.id === selectedPlanId) ?? planList[0] ?? null

  useEffect(() => {
    if (planList.length > 0 && selectedPlanId == null) {
      setSelectedPlanId(planList[0].id)
    }
  }, [planList.length, selectedPlanId])

  const getBasePrice = useCallback(
    (plan: Plan) => {
      if (billingPeriod === "annual") {
        return plan.priceAnnual ?? plan.price * 12
      }
      return plan.priceMonthly ?? plan.price
    },
    [billingPeriod]
  )

  const subtotal = selectedPlan ? getBasePrice(selectedPlan) : 0
  const discount = appliedPromo?.discount ?? 0
  const total = Math.max(0, subtotal - discount)

  const handleApplyPromo = useCallback(() => {
    const code = promoCode.trim()
    if (!code) {
      setPromoError("Enter a promo code")
      return
    }
    if (!selectedPlan?.id) {
      setPromoError("Select a plan first")
      return
    }
    setPromoError(null)
    applyPromo.mutate(
      { code, planId: selectedPlan.id, billingPeriod },
      {
        onSuccess: (result) => {
          if (result.valid && result.newTotal != null) {
            setAppliedPromo({
              code: result.code,
              discount: subtotal - result.newTotal,
              newTotal: result.newTotal,
              message: result.message ?? "Discount applied",
            })
            toast.success(result.message ?? "Promo code applied")
          } else {
            setAppliedPromo(null)
            setPromoError(result.message ?? "Invalid promo code")
            toast.error(result.message ?? "Invalid promo code")
          }
        },
        onError: () => {
          setAppliedPromo(null)
          setPromoError("Failed to validate promo code")
        },
      }
    )
  }, [promoCode, selectedPlan?.id, billingPeriod, subtotal, applyPromo])

  const validateForm = useCallback((): boolean => {
    const errs: Partial<Record<keyof BillingDetails, string>> = {}
    if (!isNotEmpty(billingDetails.contactName)) errs.contactName = "Contact name is required"
    if (!isValidEmail(billingDetails.email)) errs.email = "Valid email is required"
    if (billingDetails.taxId != null && billingDetails.taxId.trim() !== "" && !isValidVAT(billingDetails.taxId))
      errs.taxId = "Invalid VAT format"
    setBillingErrors(errs)
    if (Object.keys(errs).length > 0) return false

    if (enterpriseInvoiceEnabled) {
      const invErrs: Partial<Record<keyof InvoiceDetails, string>> = {}
      if (!isNotEmpty(invoiceDetails.recipientName)) invErrs.recipientName = "Required"
      if (!isNotEmpty(invoiceDetails.companyName)) invErrs.companyName = "Required"
      if (!isNotEmpty(invoiceDetails.billingAddress)) invErrs.billingAddress = "Required"
      setInvoiceErrors(invErrs)
      if (Object.keys(invErrs).length > 0) return false
    } else {
      setInvoiceErrors({})
      const cardErrs: Partial<Record<keyof CardFields, string>> = {}
      if (!isValidCardNumber(cardFields.cardNumber)) cardErrs.cardNumber = "Valid card number required"
      if (!isValidExpiry(cardFields.expiry)) cardErrs.expiry = "Valid expiry (MM/YY) required"
      if (!isValidCvc(cardFields.cvc)) cardErrs.cvc = "Valid CVC required"
      if (!isNotEmpty(cardFields.nameOnCard)) cardErrs.nameOnCard = "Name on card required"
      setCardErrors(cardErrs)
      if (Object.keys(cardErrs).length > 0) return false
    }

    return true
  }, [billingDetails, invoiceDetails, cardFields, enterpriseInvoiceEnabled])

  const handleSubmit = useCallback(() => {
    if (!selectedPlan?.id) {
      toast.error("Select a plan")
      return
    }
    if (!termsAccepted) {
      toast.error("Accept the terms to continue")
      return
    }
    if (!validateForm()) return

    createSubscription.mutate(
      {
        planId: selectedPlan.id,
        billingPeriod,
        promoCode: appliedPromo?.code ? promoCode.trim() : undefined,
        enterpriseInvoice: enterpriseInvoiceEnabled,
        billingDetails: billingDetails,
        invoiceDetails: enterpriseInvoiceEnabled ? invoiceDetails : undefined,
        paymentMethod: enterpriseInvoiceEnabled
          ? undefined
          : (() => {
              const [mm, yy] = (cardFields.expiry ?? "").split("/")
              let year = parseInt(yy ?? "26", 10)
              if (year < 100) year += 2000
              return {
                last4: cardFields.cardNumber.replace(/\D/g, "").slice(-4),
                brand: "visa",
                expMonth: parseInt(mm ?? "12", 10),
                expYear: year,
              }
            })(),
      },
      {
        onSuccess: (result) => {
          setSuccess({
            subscriptionId: result.subscription?.id ?? "sub-1",
            invoiceId: result.invoice?.id,
            pdfUrl: result.invoice?.pdfUrl,
            planName: selectedPlan.name,
          })
          toast.success("Subscription confirmed")
        },
        onError: () => {
          toast.error("Failed to create subscription")
        },
      }
    )
  }, [
    selectedPlan,
    termsAccepted,
    validateForm,
    billingPeriod,
    appliedPromo,
    promoCode,
    enterpriseInvoiceEnabled,
    billingDetails,
    invoiceDetails,
    cardFields,
    createSubscription,
  ])

  if (success) {
    return (
      <AnimatedPage>
        <div className="mx-auto max-w-2xl space-y-8">
          <Link
            to="/dashboard/subscription-management"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to subscription
          </Link>
          <ConfirmationPanel
            subscriptionId={success.subscriptionId}
            invoiceId={success.invoiceId}
            pdfUrl={success.pdfUrl}
            planName={success.planName}
          />
          <SubscriptionManagementLinkBlock />
        </div>
      </AnimatedPage>
    )
  }

  return (
    <AnimatedPage>
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="rounded-[1.25rem] bg-hero-bg px-6 py-10 md:px-10 md:py-12">
          <Link
            to="/dashboard/subscription-management"
            className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to subscription
          </Link>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Checkout
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            Subscribe or upgrade your plan. Secure payment with card or enterprise invoicing.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-3">
            <PlanSummaryPanel
              plans={planList}
              selectedPlanId={selectedPlanId ?? selectedPlan?.id ?? null}
              onSelectPlan={(id) => {
                setSelectedPlanId(id)
                setAppliedPromo(null)
                setPromoError(null)
              }}
              billingPeriod={billingPeriod}
              onBillingPeriodChange={(p) => {
                setBillingPeriod(p)
                setAppliedPromo(null)
                setPromoError(null)
              }}
              isLoading={plansLoading}
            />

            <Card className="card-elevated rounded-[1.25rem] overflow-hidden">
              <CardHeader>
                <CardTitle className="font-display text-lg">Billing & payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <BillingDetailsForm
                  details={billingDetails}
                  onChange={(d) => setBillingDetails((prev) => ({ ...prev, ...d }))}
                  errors={billingErrors}
                  disabled={createSubscription.isPending}
                />

                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
                  <div>
                    <Label htmlFor="enterprise-invoice" className="font-medium">
                      Enterprise invoicing
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Bill via invoice instead of card. Contact details required.
                    </p>
                  </div>
                  <Switch
                    id="enterprise-invoice"
                    checked={enterpriseInvoiceEnabled}
                    onCheckedChange={setEnterpriseInvoiceEnabled}
                    aria-label="Enable enterprise invoicing"
                  />
                </div>

                {!enterpriseInvoiceEnabled && (
                  <PaymentForm
                    fields={cardFields}
                    onChange={(d) => setCardFields((prev) => ({ ...prev, ...d }))}
                    errors={cardErrors}
                    disabled={createSubscription.isPending}
                  />
                )}

                {enterpriseInvoiceEnabled && (
                  <EnterpriseInvoiceSection
                    details={invoiceDetails}
                    onChange={(d) => setInvoiceDetails((prev) => ({ ...prev, ...d }))}
                    errors={invoiceErrors}
                    disabled={createSubscription.isPending}
                  />
                )}

                <PromoCodeSection
                  value={promoCode}
                  onChange={(v) => {
                    setPromoCode(v)
                    setPromoError(null)
                  }}
                  onApply={handleApplyPromo}
                  appliedCode={appliedPromo?.code}
                  discountMessage={appliedPromo?.message}
                  errorMessage={promoError}
                  isLoading={applyPromo.isPending}
                  disabled={createSubscription.isPending}
                />

                <TermsAndSubmit
                  termsAccepted={termsAccepted}
                  onTermsChange={setTermsAccepted}
                  onSubmit={handleSubmit}
                  isSubmitting={createSubscription.isPending}
                  disabled={!selectedPlan}
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="card-elevated sticky top-6 rounded-[1.25rem] overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display text-lg">
                  <Receipt className="h-5 w-5 text-primary" />
                  Order summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedPlan && (
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="font-medium">{selectedPlan.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {billingPeriod === "annual" ? "Annual" : "Monthly"} billing
                    </p>
                  </div>
                )}
                <SubtotalSummary
                  subtotal={subtotal}
                  discount={discount}
                  total={total}
                  discountLabel={appliedPromo ? `Promo (${appliedPromo.code})` : "Discount"}
                />
                <p className="text-xs text-muted-foreground">
                  Proration applies when changing plans. New plan starts immediately.
                </p>
              </CardContent>
            </Card>

            <div className="mt-6">
              <SubscriptionManagementLinkBlock
                title="Already have a subscription?"
                description="Manage your plan, payment methods, and invoices."
              />
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  )
}
