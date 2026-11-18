"use client"

import { useState } from "react"
import { bookingFee, illustrativePerTicketFee } from "@/lib/fees"
import { money } from "@/lib/format"
import { cn } from "@/lib/utils"

const PRICES = [500, 1000, 1500, 2000, 3000, 5000, 10000]

export function FeeComparison({ className }: { className?: string }) {
  const [price, setPrice] = useState(1500)
  const [qty, setQty] = useState(4)
  const ours = bookingFee(price * qty, qty)
  const theirs = illustrativePerTicketFee(price, qty)
  const max = Math.max(ours, theirs)
  const saving = theirs - ours

  return (
    <div className={cn("rounded-2xl border bg-card p-5 shadow-sm sm:p-6", className)}>
      <div className="grid gap-5 sm:grid-cols-2">
        <fieldset>
          <legend className="mb-2 text-xs font-medium text-muted-foreground">Ticket price</legend>
          <div className="flex flex-wrap gap-1.5">
            {PRICES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPrice(p)}
                className={cn(
                  "h-8 rounded-lg border px-2.5 text-sm tabular transition-colors",
                  p === price ? "border-foreground bg-foreground text-background" : "hover:bg-muted"
                )}
              >
                ${p / 100}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-2 text-xs font-medium text-muted-foreground">Tickets in the order</legend>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={1}
              max={8}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="w-full accent-[var(--brand)]"
              aria-label="Tickets in the order"
            />
            <span className="w-6 text-right text-sm font-medium tabular">{qty}</span>
          </div>
        </fieldset>
      </div>

      <div className="mt-6 space-y-4">
        <Bar label="Us · one fee per order" value={ours} max={max} highlight />
        <Bar label="Typical per-ticket fee" value={theirs} max={max} />
      </div>

      <div className="mt-6 flex items-baseline justify-between border-t pt-4">
        <span className="text-sm text-muted-foreground">
          Buyer pays {money(price * qty + ours)} all-in
        </span>
        <span className="text-sm font-medium">
          {saving > 0 ? (
            <>
              Saves <span className="text-brand">{money(saving)}</span> on this order
            </>
          ) : (
            "About the same"
          )}
        </span>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Per-ticket model shown is illustrative ($0.99 + 2.5% per ticket).
      </p>
    </div>
  )
}

function Bar({ label, value, max, highlight }: { label: string; value: number; max: number; highlight?: boolean }) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-sm">
        <span className={highlight ? "font-medium" : "text-muted-foreground"}>{label}</span>
        <span className="tabular font-medium">{money(value)}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all duration-500", highlight ? "bg-brand" : "bg-foreground/25")}
          style={{ width: `${Math.max(4, (value / max) * 100)}%` }}
        />
      </div>
    </div>
  )
}
