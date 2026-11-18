import type { Metadata } from "next"
import { FeeCalculator } from "@/components/site/fee-calculator"
import { bookingFee, DEFAULT_FEE_SETTINGS as S } from "@/lib/fees"
import { money } from "@/lib/format"

export const metadata: Metadata = { title: "Pricing" }

const EXAMPLES = [
  { qty: 1, price: 1000 },
  { qty: 1, price: 2000 },
  { qty: 2, price: 1500 },
  { qty: 4, price: 2000 },
  { qty: 6, price: 1200 },
  { qty: 2, price: 8500 },
]

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="text-sm font-medium text-brand">Pricing</p>
      <h1 className="mt-2 text-4xl font-semibold">One fee per order. Free events are free.</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
        No subscriptions, no setup cost. Buyers pay a single booking fee on each order that covers card processing,
        payouts and a small platform margin of {money(S.mt)} per paid ticket. Your society gets the full ticket price.
      </p>

      <div className="mt-10">
        <FeeCalculator />
      </div>

      <h2 className="mt-16 text-xl font-semibold">Examples</h2>
      <div className="mt-4 overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 font-medium">Order</th>
              <th className="px-4 py-2.5 text-right font-medium">Society gets</th>
              <th className="px-4 py-2.5 text-right font-medium">Booking fee</th>
              <th className="px-4 py-2.5 text-right font-medium">Buyer pays</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {EXAMPLES.map((e) => {
              const sub = e.qty * e.price
              const fee = bookingFee(sub, e.qty)
              return (
                <tr key={`${e.qty}-${e.price}`}>
                  <td className="px-4 py-3">
                    {e.qty} × {money(e.price)}
                  </td>
                  <td className="px-4 py-3 text-right tabular">{money(sub)}</td>
                  <td className="px-4 py-3 text-right tabular">{money(fee)}</td>
                  <td className="px-4 py-3 text-right font-medium tabular">{money(sub + fee)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <h2 className="mt-16 text-xl font-semibold">How the fee is calculated</h2>
      <p className="mt-3 text-muted-foreground">
        For an order with ticket subtotal <i>S</i> (after discounts) and <i>n</i> paid tickets, the booking fee is:
      </p>
      <pre className="mt-4 overflow-x-auto rounded-xl bg-muted/60 p-4 font-mono text-sm">
        F = ⌈ (S × ({S.ps} + {S.pc}) + {S.fs}¢ + n × ({S.a}¢ + {S.mt}¢){S.mo ? ` + ${S.mo}¢` : ""}) ÷ (1 − {S.ps}) ⌉
      </pre>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        <li>· {S.ps * 100}% + {S.fs}¢ — Stripe&apos;s domestic card processing on the whole charge</li>
        <li>· {S.pc * 100}% — Stripe Connect payout fee on the money sent to your society</li>
        <li>· {S.a}¢ per ticket — monthly account and payout fees, shared across tickets</li>
        <li>· {S.mt}¢ per paid ticket — the platform margin</li>
      </ul>

      <div className="mt-16 grid gap-6 sm:grid-cols-3">
        {[
          ["Refunds", "Organisers can refund the ticket price at any time before payout. Cancelled events are refunded in full, booking fee included."],
          ["Payouts", "Ticket money is released to your society's bank two days after the event ends, automatically."],
          ["No surcharges", "The fee is identical for every payment method, including Apple Pay and Google Pay."],
        ].map(([t, b]) => (
          <div key={t}>
            <h3 className="font-medium">{t}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{b}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
