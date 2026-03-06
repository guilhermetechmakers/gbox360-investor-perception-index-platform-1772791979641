import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { FAQItem } from "@/types/about-help"
import { cn } from "@/lib/utils"

interface FAQAccordionProps {
  faqItems: FAQItem[] | null | undefined
  allowMultiple?: boolean
  className?: string
}

export function FAQAccordion({
  faqItems,
  allowMultiple = false,
  className,
}: FAQAccordionProps) {
  const items = Array.isArray(faqItems) ? faqItems : []
  const sortedItems = [...items].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  )

  if (sortedItems.length === 0) {
    return (
      <Card
        className={cn(
          "rounded-[1rem] border border-border bg-card shadow-card",
          className
        )}
      >
        <CardHeader>
          <CardTitle className="font-display text-2xl font-semibold text-foreground">
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No FAQ items available at this time. Please check back later or
            contact support.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        "rounded-[1rem] border border-border bg-card shadow-card transition-all duration-300 hover:shadow-lg",
        className
      )}
    >
      <CardHeader>
        <CardTitle className="font-display text-2xl font-semibold text-foreground">
          Frequently Asked Questions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {allowMultiple ? (
          <Accordion
            type="multiple"
            defaultValue={[sortedItems[0]?.id].filter(Boolean) as string[]}
            className="w-full"
          >
            {(sortedItems ?? []).map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="border-b border-border px-0 last:border-b-0"
              >
                <AccordionTrigger
                  className="text-left font-medium text-foreground hover:no-underline hover:text-primary"
                  aria-controls={`faq-content-${item.id}`}
                  id={`faq-trigger-${item.id}`}
                >
                  {item.question}
                </AccordionTrigger>
                <AccordionContent
                  id={`faq-content-${item.id}`}
                  aria-labelledby={`faq-trigger-${item.id}`}
                  className="text-muted-foreground"
                >
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        ) : (
          <Accordion
            type="single"
            collapsible
            defaultValue={sortedItems[0]?.id}
            className="w-full"
          >
            {(sortedItems ?? []).map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="border-b border-border px-0 last:border-b-0"
              >
                <AccordionTrigger
                  className="text-left font-medium text-foreground hover:no-underline hover:text-primary"
                  aria-controls={`faq-content-${item.id}`}
                  id={`faq-trigger-${item.id}`}
                >
                  {item.question}
                </AccordionTrigger>
                <AccordionContent
                  id={`faq-content-${item.id}`}
                  aria-labelledby={`faq-trigger-${item.id}`}
                  className="text-muted-foreground"
                >
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        )}
      </CardContent>
    </Card>
  )
}
