import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CreditCard, Plus } from "lucide-react"
import { safeArray } from "@/lib/data-guard"
import { usePaymentMethods } from "@/hooks/useSubscription"
import { PaymentMethodRow } from "./PaymentMethodRow"
import { AddPaymentMethodModal } from "./AddPaymentMethodModal"
import { useState } from "react"

export function PaymentMethodsPanel() {
  const { data: paymentMethods = [], isLoading } = usePaymentMethods()
  const [addOpen, setAddOpen] = useState(false)
  const methods = safeArray(paymentMethods)

  return (
    <>
      <Card className="card-elevated rounded-[1rem]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <CreditCard className="h-5 w-5" />
            Payment methods
          </CardTitle>
          <CardDescription>Add, remove, or set a default payment method.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : methods.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-8 text-center text-muted-foreground">
              <p>No payment methods on file.</p>
              <Button
                className="mt-4"
                onClick={() => setAddOpen(true)}
                aria-label="Add payment method"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add payment method
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {methods.map((pm) => (
                <PaymentMethodRow key={pm.id} method={pm} />
              ))}
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setAddOpen(true)}
                aria-label="Add another payment method"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add payment method
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <AddPaymentMethodModal open={addOpen} onOpenChange={setAddOpen} />
    </>
  )
}
