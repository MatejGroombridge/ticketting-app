"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Clock, Loader2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EventCover } from "@/components/event-cover"
import { summarise, type Selection } from "@/lib/cart"
import { saveDemoOrder, randomToken } from "@/lib/demo-orders"
import { formatDate, formatTime, money } from "@/lib/format"
import { findPromo } from "@/lib/mock-data"
import type { Order, Society, Ticket, TicketEvent } from "@/lib/types"
import { cn } from "@/lib/utils"

const HOLD_SECONDS = 10 * 60

export function CheckoutForm({
  event,
  society,
  selection,
  promoCode,
  member,
}: {
  event: TicketEvent
  society: Society
  selection: Selection
  promoCode?: string
  member?: string
}) {
  const router = useRouter()
  const promo = promoCode ? findPromo(event.id, promoCode) ?? null : null
  const s = useMemo(() => summarise(event, selection, promo), [event, selection, promo])
  const [left, setLeft] = useState(HOLD_SECONDS)
  const [name, setName] = useState("")
  const [email, setEmail] = useState(member?.includes("@") ? member : "")
  const [marketing, setMarketing] = useState(false)
  const [paying, setPaying] = useState<null | "card" | "wallet">(null)
  const [touched, setTouched] = useState(false)
  const free = s.total === 0
  const eventUrl = `/e/${society.slug}/${event.slug}`

  useEffect(() => {
    const started = Date.now()
    const id = setInterval(() => {
      setLeft(Math.max(0, HOLD_SECONDS - Math.floor((Date.now() - started) / 1000)))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const emailOk = /^\S+@\S+\.\S+$/.test(email)
  const valid = name.trim().length > 1 && emailOk

  function complete(method: "card" | "wallet") {
    setTouched(true)
    if (!valid) return
    setPaying(method)
    // Stands in for: create pending order + hold → Stripe Checkout → webhook marks paid.
    setTimeout(() => {
      const token = randomToken()
      const orderId = `ord_${token.slice(0, 8)}`
      const order: Order = {
        id: orderId,
        token,
        eventId: event.id,
        buyerName: name.trim(),
        buyerEmail: email.trim(),
        status: "paid",
        items: s.lines.map((l) => ({ ticketTypeId: l.type.id, quantity: l.qty, unitPriceCents: l.type.priceCents })),
        promoCode: promo?.code,
        subtotalCents: s.subtotal,
        discountCents: s.discount,
        bookingFeeCents: s.fee,
        totalCents: s.total,
        stripeFeeCents: 0,
        refundedCents: 0,
        createdAt: new Date().toISOString(),
      }
      let n = 0
      const tickets: Ticket[] = s.lines.flatMap((l) =>
        Array.from({ length: l.qty }, () => {
          n++
          return {
            id: `${orderId}_${n}`,
            orderId,
            eventId: event.id,
            ticketTypeId: l.type.id,
            attendeeName: n === 1 ? name.trim() : `${name.trim().split(" ")[0]}'s guest${n > 2 ? ` ${n - 1}` : ""}`,
            qrToken: randomToken(26),
            status: "valid" as const,
          }
        })
      )
      saveDemoOrder({ order, tickets })
      router.push(`/t/${token}?new=1`)
    }, 1200)
  }

  if (s.qty === 0) {
    return (
      <Centered>
        <h1 className="text-xl font-semibold">Your selection is empty</h1>
        <p className="mt-2 text-muted-foreground">Pick some tickets first.</p>
        <Button className="mt-6" nativeButton={false} render={<Link href={eventUrl} />}>
          Back to event
        </Button>
      </Centered>
    )
  }

  if (left === 0) {
    return (
      <Centered>
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-muted">
          <Clock className="size-5" />
        </div>
        <h1 className="text-xl font-semibold">Your hold has expired</h1>
        <p className="mt-2 text-muted-foreground">
          We held your tickets for 10 minutes and released them so others could buy. You haven&apos;t been charged.
        </p>
        <Button className="mt-6" nativeButton={false} render={<Link href={eventUrl} />}>
          Start again
        </Button>
      </Centered>
    )
  }

  const mm = Math.floor(left / 60)
  const ss = String(left % 60).padStart(2, "0")

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <Link href={eventUrl} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to event
      </Link>

      <div
        role="timer"
        aria-live="off"
        className={cn(
          "mt-4 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm",
          left < 120 ? "bg-warning/15" : "bg-brand-soft"
        )}
      >
        <Clock className="size-4" />
        <span>
          We&apos;re holding your tickets for <span className="font-semibold tabular">{mm}:{ss}</span>
        </span>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <section>
            <h1 className="text-2xl font-semibold">{free ? "Register" : "Checkout"}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              No account needed. We&apos;ll email your tickets to you.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10"
                  aria-invalid={touched && name.trim().length < 2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10"
                  aria-invalid={touched && !emailOk}
                />
              </div>
            </div>
            {touched && !valid && (
              <p className="mt-3 text-sm text-destructive">Enter your name and a valid email so we can send your tickets.</p>
            )}
            <label className="mt-4 flex items-start gap-2.5 text-sm text-muted-foreground">
              <Checkbox checked={marketing} onCheckedChange={(v) => setMarketing(!!v)} className="mt-0.5" />
              Email me about future events from {society.name}. You can unsubscribe at any time.
            </label>
          </section>

          {free ? (
            <Button className="h-11 w-full text-base sm:w-auto sm:px-8" onClick={() => complete("card")} disabled={!!paying}>
              {paying && <Loader2 className="animate-spin" />} Get my tickets
            </Button>
          ) : (
            <section>
              <h2 className="font-semibold">Payment</h2>
              <div className="mt-3 rounded-2xl border border-dashed p-5">
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button
                    className="h-11 bg-black text-white hover:bg-black/85"
                    onClick={() => complete("wallet")}
                    disabled={!!paying}
                  >
                    {paying === "wallet" ? <Loader2 className="animate-spin" /> : ""} Apple Pay
                  </Button>
                  <Button variant="outline" className="h-11" onClick={() => complete("wallet")} disabled={!!paying}>
                    Google Pay
                  </Button>
                </div>
                <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="h-px flex-1 bg-border" /> or pay by card <div className="h-px flex-1 bg-border" />
                </div>
                <div className="grid h-28 place-items-center rounded-xl bg-muted/50 text-center text-sm text-muted-foreground">
                  <div>
                    <Lock className="mx-auto mb-2 size-4" />
                    Embedded Stripe Checkout mounts here.
                    <br />
                    Card details never touch our servers.
                  </div>
                </div>
                <Button className="mt-4 h-11 w-full text-base" onClick={() => complete("card")} disabled={!!paying}>
                  {paying === "card" && <Loader2 className="animate-spin" />} Pay {money(s.total)}
                </Button>
              </div>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="overflow-hidden rounded-2xl border bg-card">
            <div className="flex gap-3 border-b p-4">
              <EventCover hue={event.hue} className="size-14 shrink-0 rounded-lg" />
              <div className="min-w-0">
                <div className="truncate font-medium">{event.title}</div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(event.startsAt)} · {formatTime(event.startsAt)}
                </div>
                <div className="truncate text-sm text-muted-foreground">{event.venue}</div>
              </div>
            </div>
            <div className="space-y-2 p-4 text-sm">
              {s.lines.map((l) => (
                <div key={l.type.id} className="flex justify-between">
                  <span>
                    {l.qty} × {l.type.name}
                  </span>
                  <span className="tabular">{money(l.total, { free: true })}</span>
                </div>
              ))}
              {s.discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Promo {promo?.code}</span>
                  <span className="tabular">−{money(s.discount)}</span>
                </div>
              )}
              {s.fee > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Booking fee</span>
                  <span className="tabular">{money(s.fee)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-3 text-base font-semibold">
                <span>Total</span>
                <span className="tabular">{money(s.total)} AUD</span>
              </div>
            </div>
            <p className="border-t bg-muted/30 px-4 py-3 text-xs text-muted-foreground">{society.refundPolicy}</p>
          </div>
        </aside>
      </div>
    </div>
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-md px-4 py-24 text-center">{children}</div>
}
