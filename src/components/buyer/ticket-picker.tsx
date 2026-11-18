"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Lock, Minus, Plus, Tag, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { availability, encodeSelection, promoError, summarise, type Selection } from "@/lib/cart"
import { bookingFee } from "@/lib/fees"
import { formatDate, money, pluralise } from "@/lib/format"
import { findPromo, isMember } from "@/lib/mock-data"
import type { PromoCode, Society, TicketEvent, TicketType } from "@/lib/types"
import { cn } from "@/lib/utils"

export function TicketPicker({ event, society }: { event: TicketEvent; society: Society }) {
  const router = useRouter()
  const [sel, setSel] = useState<Selection>({})
  const [memberId, setMemberId] = useState("")
  const [verified, setVerified] = useState<string | null>(null)
  const [memberError, setMemberError] = useState<string | null>(null)
  const [promoInput, setPromoInput] = useState("")
  const [promo, setPromo] = useState<PromoCode | null>(null)
  const [promoMsg, setPromoMsg] = useState<string | null>(null)
  const [showPromo, setShowPromo] = useState(false)

  const hasMembersOnly = event.ticketTypes.some((t) => t.membersOnly)
  const summary = useMemo(() => summarise(event, sel, promo), [event, sel, promo])
  const disabled = event.status !== "published"

  const setQty = (t: TicketType, qty: number) =>
    setSel((s) => ({ ...s, [t.id]: Math.max(0, Math.min(qty, t.maxPerOrder)) }))

  function verify() {
    if (isMember(society, memberId)) {
      setVerified(memberId.trim())
      setMemberError(null)
    } else {
      setMemberError(
        "We couldn't find you on the member list. Check you used the email or student ID you joined with."
      )
    }
  }

  function applyPromo() {
    const p = findPromo(event.id, promoInput)
    const err = promoError(p)
    if (err) {
      setPromo(null)
      setPromoMsg(err)
    } else {
      setPromo(p!)
      setPromoMsg(null)
    }
  }

  function checkout() {
    const params = new URLSearchParams({ items: encodeSelection(sel) })
    if (promo) params.set("promo", promo.code)
    if (verified) params.set("member", verified)
    router.push(`/e/${society.slug}/${event.slug}/checkout?${params}`)
  }

  return (
    <div id="tickets" className="scroll-mt-20 rounded-2xl border bg-card shadow-sm">
      <div className="border-b px-5 py-4">
        <h2 className="font-semibold">Tickets</h2>
        <p className="text-xs text-muted-foreground">Prices include the booking fee for one ticket.</p>
      </div>

      <ul className="divide-y">
        {event.ticketTypes.map((t) => (
          <TicketRow
            key={t.id}
            type={t}
            qty={sel[t.id] ?? 0}
            locked={t.membersOnly && !verified}
            disabled={disabled}
            onChange={(q) => setQty(t, q)}
          />
        ))}
      </ul>

      {hasMembersOnly && !disabled && (
        <div className="border-t px-5 py-4">
          {verified ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="grid size-5 place-items-center rounded-full bg-success text-background">
                <Check className="size-3" />
              </span>
              <span>
                Member verified <span className="text-muted-foreground">· {verified}</span>
              </span>
              <button
                className="ml-auto text-xs text-muted-foreground underline"
                onClick={() => {
                  setVerified(null)
                  setSel((s) =>
                    Object.fromEntries(
                      Object.entries(s).filter(([id]) => !event.ticketTypes.find((t) => t.id === id)?.membersOnly)
                    )
                  )
                }}
              >
                Change
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                verify()
              }}
            >
              <label htmlFor="member-id" className="text-sm font-medium">
                Member? Unlock member pricing
              </label>
              <div className="mt-2 flex gap-2">
                <Input
                  id="member-id"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  placeholder="Student email or ID"
                  className="h-9"
                  autoComplete="email"
                />
                <Button type="submit" variant="outline" className="h-9" disabled={!memberId.trim()}>
                  Verify
                </Button>
              </div>
              {memberError && <p className="mt-2 text-xs text-destructive">{memberError}</p>}
              <p className="mt-2 text-xs text-muted-foreground">
                Try <code>z5312344</code> or any @{society.emailDomains[0] ?? "student"} email.
              </p>
            </form>
          )}
        </div>
      )}

      {summary.qty > 0 && (
        <div className="space-y-2 border-t bg-muted/30 px-5 py-4 text-sm">
          {summary.lines.map((l) => (
            <div key={l.type.id} className="flex justify-between">
              <span>
                {l.qty} × {l.type.name}
              </span>
              <span className="tabular">{money(l.total, { free: true })}</span>
            </div>
          ))}
          {promo && (
            <div className="flex justify-between text-success">
              <span className="flex items-center gap-1.5">
                <Tag className="size-3.5" /> {promo.code}
                <button aria-label="Remove promo code" onClick={() => setPromo(null)} className="text-muted-foreground">
                  <X className="size-3.5" />
                </button>
              </span>
              <span className="tabular">−{money(summary.discount)}</span>
            </div>
          )}
          {summary.fee > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Booking fee · once per order</span>
              <span className="tabular">{money(summary.fee)}</span>
            </div>
          )}
          <div className="flex justify-between border-t pt-2 text-base font-semibold">
            <span>Total</span>
            <span className="tabular">{money(summary.total)}</span>
          </div>
        </div>
      )}

      {!disabled && summary.subtotal > 0 && (
        <div className="border-t px-5 py-3">
          {showPromo || promo ? (
            !promo && (
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  applyPromo()
                }}
              >
                <Input
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  placeholder="Promo code"
                  className="h-9 uppercase"
                  aria-label="Promo code"
                  autoFocus
                />
                <Button type="submit" variant="outline" className="h-9" disabled={!promoInput}>
                  Apply
                </Button>
              </form>
            )
          ) : (
            <button className="text-sm text-muted-foreground hover:text-foreground" onClick={() => setShowPromo(true)}>
              Have a promo code?
            </button>
          )}
          {promoMsg && <p className="mt-2 text-xs text-destructive">{promoMsg}</p>}
          {showPromo && !promo && !promoMsg && (
            <p className="mt-2 text-xs text-muted-foreground">
              Try <code>FINALS20</code>
            </p>
          )}
        </div>
      )}

      <div className="p-5 pt-3">
        <Button className="h-11 w-full text-base" disabled={summary.qty === 0 || disabled} onClick={checkout}>
          {disabled
            ? event.status === "ended"
              ? "This event has ended"
              : event.status === "cancelled"
                ? "This event was cancelled"
                : "Not on sale yet"
            : summary.qty === 0
              ? "Select tickets"
              : summary.total === 0
                ? `Register · ${pluralise(summary.qty, "ticket")}`
                : `Checkout · ${money(summary.total)}`}
        </Button>
      </div>
    </div>
  )
}

function TicketRow({
  type: t,
  qty,
  locked,
  disabled,
  onChange,
}: {
  type: TicketType
  qty: number
  locked: boolean
  disabled: boolean
  onChange: (q: number) => void
}) {
  const a = availability(t)
  const allIn = t.priceCents + bookingFee(t.priceCents, t.priceCents > 0 ? 1 : 0)
  const fee = allIn - t.priceCents
  const sellable = a.kind === "available" && !locked && !disabled
  const max = a.kind === "available" ? Math.min(t.maxPerOrder, a.left) : 0

  return (
    <li className={cn("flex items-center gap-4 px-5 py-4", !sellable && !locked && "opacity-60")}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 font-medium">
          {t.name}
          {t.membersOnly && <Lock className="size-3.5 text-muted-foreground" aria-label="Members only" />}
        </div>
        <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 text-sm">
          <span className="font-semibold tabular">{money(allIn, { free: true })}</span>
          {fee > 0 && (
            <span className="text-xs text-muted-foreground">
              {money(t.priceCents)} + {money(fee)} fee
            </span>
          )}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          {a.kind === "soldout" && "Sold out"}
          {a.kind === "closed" && "Sales closed"}
          {a.kind === "notyet" && `On sale ${formatDate(a.opens)}`}
          {a.kind === "available" && locked && "Members only — verify below"}
          {a.kind === "available" && !locked && (a.left <= 15 ? `Only ${a.left} left` : t.description)}
        </div>
      </div>
      {sellable ? (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            aria-label={`Fewer ${t.name}`}
            disabled={qty === 0}
            onClick={() => onChange(qty - 1)}
          >
            <Minus />
          </Button>
          <span className="w-7 text-center font-medium tabular" aria-live="polite">
            {qty}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            aria-label={`More ${t.name}`}
            disabled={qty >= max}
            onClick={() => onChange(qty + 1)}
          >
            <Plus />
          </Button>
        </div>
      ) : null}
    </li>
  )
}
