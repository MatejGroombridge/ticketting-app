"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { feeBreakdown } from "@/lib/fees"
import { money } from "@/lib/format"

export function FeeCalculator() {
  const [price, setPrice] = useState("20")
  const [qty, setQty] = useState("1")
  const priceCents = Math.max(0, Math.round(Number(price || 0) * 100))
  const n = Math.max(0, Math.min(50, Math.floor(Number(qty || 0))))
  const b = feeBreakdown(priceCents * n, priceCents > 0 ? n : 0)

  return (
    <div className="grid overflow-hidden rounded-2xl border bg-card md:grid-cols-[1fr_1.2fr]">
      <div className="space-y-5 border-b p-6 md:border-r md:border-b-0">
        <div className="space-y-2">
          <Label htmlFor="calc-price">Ticket price (AUD)</Label>
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id="calc-price"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ""))}
              className="h-10 pl-7 text-base tabular"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="calc-qty">Tickets in one order</Label>
          <Input
            id="calc-qty"
            inputMode="numeric"
            value={qty}
            onChange={(e) => setQty(e.target.value.replace(/\D/g, ""))}
            className="h-10 text-base tabular"
          />
        </div>
        <div className="rounded-xl bg-muted/60 p-4">
          <div className="text-xs text-muted-foreground">Buyer pays</div>
          <div className="mt-1 text-3xl font-semibold tabular">{money(b.total)}</div>
          <div className="mt-1 text-sm text-muted-foreground">
            {b.bookingFee === 0 ? "No booking fee" : `${money(b.bookingFee)} booking fee for the whole order`}
          </div>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-sm font-medium">Where the money goes</h3>
        <dl className="mt-4 space-y-3 text-sm">
          <Row label="Your society receives" value={b.subtotal} strong />
          <div className="border-t" />
          <Row label="Booking fee" value={b.bookingFee} strong />
          <Row label="Card processing (Stripe)" value={b.stripeProcessing} sub />
          <Row label="Payout fee (Stripe Connect)" value={b.connectFee} sub />
          <Row label="Account fees" value={b.accountFees} sub />
          <Row label="Platform" value={b.platformMargin} sub />
        </dl>
        <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
          Processing estimate assumes a domestic card. The booking fee is the same for every payment method and is never a card surcharge.
        </p>
      </div>
    </div>
  )
}

function Row({ label, value, strong, sub }: { label: string; value: number; strong?: boolean; sub?: boolean }) {
  return (
    <div className={`flex justify-between ${sub ? "pl-4 text-muted-foreground" : ""}`}>
      <dt className={strong ? "font-medium" : ""}>{label}</dt>
      <dd className={`tabular ${strong ? "font-medium" : ""}`}>{money(value)}</dd>
    </div>
  )
}
