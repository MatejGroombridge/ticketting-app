"use client"

import { useState } from "react"
import Link from "next/link"
import { CalendarPlus, CheckCircle2, MapPin, Undo2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { EventCover } from "@/components/event-cover"
import { QrCode } from "@/components/qr-code"
import { TicketStatusBadge } from "@/components/status-badge"
import { formatDate, formatTimeRange, money } from "@/lib/format"
import type { Order, Society, Ticket, TicketEvent } from "@/lib/types"
import { cn } from "@/lib/utils"

function icsHref(event: TicketEvent) {
  const f = (iso: string) => iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "")
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Stub//Tickets//EN",
    "BEGIN:VEVENT",
    `UID:${event.id}@stub`,
    `DTSTAMP:${f(new Date().toISOString())}`,
    `DTSTART:${f(event.startsAt)}`,
    `DTEND:${f(event.endsAt)}`,
    `SUMMARY:${event.title}`,
    `LOCATION:${event.venue}, ${event.address}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n")
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(body)}`
}

export function TicketView({
  event,
  society,
  order,
  tickets,
  isNew,
}: {
  event: TicketEvent
  society: Society
  order: Order
  tickets: Ticket[]
  isNew?: boolean
}) {
  const typeName = (id: string) => event.ticketTypes.find((t) => t.id === id)?.name ?? "Ticket"
  const [requested, setRequested] = useState(false)
  const canRequestRefund =
    order.totalCents > 0 && tickets.some((t) => t.status === "valid") && event.status === "published"

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:py-12">
      {isNew && (
        <div className="mb-6 flex gap-3 rounded-2xl bg-success/10 p-4">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />
          <div className="text-sm">
            <div className="font-medium">You&apos;re going!</div>
            <div className="text-muted-foreground">
              We&apos;ve emailed a link to these tickets to {order.buyerEmail}. Bookmark this page or show the QR codes at the door.
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border bg-card">
        <EventCover hue={event.hue} className="h-28" />
        <div className="p-5">
          <p className="text-sm text-muted-foreground">{society.name}</p>
          <h1 className="mt-1 text-2xl font-semibold">{event.title}</h1>
          <div className="mt-4 space-y-1 text-sm">
            <p className="font-medium">
              {formatDate(event.startsAt)} · {formatTimeRange(event.startsAt, event.endsAt)}
            </p>
            <p className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="size-3.5" /> {event.venue}, {event.address}
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" nativeButton={false} render={<a href={icsHref(event)} download={`${event.slug}.ics`} />}>
              <CalendarPlus /> Add to calendar
            </Button>
            <Button variant="ghost" size="sm" nativeButton={false} render={<Link href={`/e/${society.slug}/${event.slug}`} />}>
              Event details
            </Button>
          </div>
        </div>
      </div>

      <h2 className="mt-8 mb-3 text-sm font-medium text-muted-foreground">
        {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"} · Order {order.id.slice(4).toUpperCase()}
      </h2>

      <div className="space-y-4">
        {tickets.map((t, i) => {
          const inactive = t.status === "refunded" || t.status === "void"
          return (
            <article key={t.id} className="relative overflow-hidden rounded-2xl border bg-card">
              <div className="flex items-start justify-between gap-3 p-5">
                <div>
                  <div className="text-xs text-muted-foreground">
                    Ticket {i + 1} of {tickets.length}
                  </div>
                  <div className="mt-1 font-semibold">{t.attendeeName}</div>
                  <div className="text-sm text-muted-foreground">{typeName(t.ticketTypeId)}</div>
                </div>
                <TicketStatusBadge status={t.status} />
              </div>
              <div className="relative">
                <div className="absolute top-1/2 -left-3 size-6 -translate-y-1/2 rounded-full border bg-background" />
                <div className="absolute top-1/2 -right-3 size-6 -translate-y-1/2 rounded-full border bg-background" />
                <div className="mx-5 border-t-2 border-dashed" />
              </div>
              <div className="relative p-6">
                <div className="mx-auto w-full max-w-[240px] rounded-xl bg-white p-3">
                  <QrCode value={t.qrToken} dim={inactive} className="text-black" />
                </div>
                {inactive && (
                  <div className="absolute inset-0 grid place-items-center">
                    <span className="rounded-full bg-background px-3 py-1 text-sm font-medium shadow-sm ring-1 ring-border">
                      This ticket was {t.status === "refunded" ? "refunded" : "voided"}
                    </span>
                  </div>
                )}
                <p className="mt-3 text-center font-mono text-[11px] tracking-wider text-muted-foreground">
                  {t.qrToken.slice(0, 4)} {t.qrToken.slice(4, 8)} {t.qrToken.slice(8, 12)}
                </p>
              </div>
            </article>
          )
        })}
      </div>

      <div className="mt-8 rounded-2xl border p-5 text-sm">
        <div className="space-y-1.5">
          <Row label="Tickets" value={money(order.subtotalCents, { free: true })} />
          {order.discountCents > 0 && <Row label={`Promo ${order.promoCode ?? ""}`} value={`−${money(order.discountCents)}`} />}
          {order.bookingFeeCents > 0 && <Row label="Booking fee" value={money(order.bookingFeeCents)} />}
          <Row label="Total paid" value={money(order.totalCents)} strong />
          {order.refundedCents > 0 && <Row label="Refunded" value={`−${money(order.refundedCents)}`} />}
        </div>
        <p className="mt-4 border-t pt-4 text-muted-foreground">{society.refundPolicy}</p>
        {canRequestRefund && (
          <RefundRequestDialog
            disabled={requested}
            onSubmit={() => {
              setRequested(true)
              toast.success("Request sent", { description: `${society.name} will email you once it's reviewed.` })
            }}
          />
        )}
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Lost a link? <Link href="/tickets/lookup" className="underline">Find all my tickets</Link>
      </p>
    </div>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={cn("flex justify-between", strong ? "font-medium" : "text-muted-foreground")}>
      <span>{label}</span>
      <span className="tabular">{value}</span>
    </div>
  )
}

function RefundRequestDialog({ onSubmit, disabled }: { onSubmit: () => void; disabled: boolean }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="mt-4" disabled={disabled} />}>
        <Undo2 /> {disabled ? "Refund requested" : "Request a refund"}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request a refund</DialogTitle>
          <DialogDescription>
            Your request goes to the society&apos;s organisers. Refunds return the ticket price; the booking fee is only refunded if the event is cancelled.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="reason">Reason (optional)</Label>
          <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              setOpen(false)
              onSubmit()
            }}
          >
            Send request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
