import type { Invoice } from "@/types/invoice"

interface BillingMetadataPanelProps {
  invoice: Invoice
}

export function BillingMetadataPanel({ invoice }: BillingMetadataPanelProps) {
  const meta = invoice?.metadata
  if (!meta) return null

  const hasContent =
    meta.billingAccountId ?? meta.customerId ?? (meta.entitlements?.length ?? 0) > 0
  if (!hasContent) return null

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4">
      <h4 className="mb-3 font-medium text-muted-foreground">
        Billing metadata
      </h4>
      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        {meta.billingAccountId && (
          <div>
            <dt className="text-muted-foreground">Billing account</dt>
            <dd className="font-mono">{meta.billingAccountId}</dd>
          </div>
        )}
        {meta.customerId && (
          <div>
            <dt className="text-muted-foreground">Customer ID</dt>
            <dd className="font-mono">{meta.customerId}</dd>
          </div>
        )}
        {Array.isArray(meta.entitlements) && meta.entitlements.length > 0 && (
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Entitlements</dt>
            <dd className="mt-1 flex flex-wrap gap-1">
              {meta.entitlements.map((e) => (
                <span
                  key={e}
                  className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                >
                  {e}
                </span>
              ))}
            </dd>
          </div>
        )}
      </dl>
    </div>
  )
}
