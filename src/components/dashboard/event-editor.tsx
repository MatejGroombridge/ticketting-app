"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, ImagePlus, Lock, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { EventCover } from "@/components/event-cover"
import { SimpleSelect } from "@/components/simple-select"
import { EventStatusBadge, Pill } from "@/components/status-badge"
import { bookingFee } from "@/lib/fees"
import { NOW } from "@/lib/clock"
import { formatDate, formatShortDate, formatTime, money } from "@/lib/format"
import type { EventStatus, PromoCode, Society, TicketEvent, Visibility } from "@/lib/types"
import { cn } from "@/lib/utils"

type TT = {
  id: string
  name: string
  price: string
  capacity: string
  maxPerOrder: string
  salesStart: string
  salesEnd: string
  membersOnly: boolean
  sold: number
}

const toLocal = (iso: string) =>
  new Date(iso).toLocaleString("sv-SE", { timeZone: "Australia/Sydney" }).replace(" ", "T").slice(0, 16)
// Treats the local input as Sydney time; good enough for the mock (the backend stores UTC).
const fromLocal = (v: string) => (v ? new Date(`${v}:00+11:00`).toISOString() : new Date().toISOString())

const cents = (v: string) => Math.max(0, Math.round(Number(v || 0) * 100))

export function EventEditor({
  society,
  event,
  promos = [],
  orderCount = 0,
  refundTotal = 0,
}: {
  society: Society
  event?: TicketEvent
  promos?: PromoCode[]
  orderCount?: number
  refundTotal?: number
}) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const isNew = !event
  const [status, setStatus] = useState<EventStatus>(event?.status ?? "draft")
  const [cover, setCover] = useState<string | undefined>()
  const [d, setD] = useState({
    title: event?.title ?? "",
    summary: event?.summary ?? "",
    description: event?.description ?? "",
    venue: event?.venue ?? "",
    address: event?.address ?? "",
    start: event ? toLocal(event.startsAt) : "",
    end: event ? toLocal(event.endsAt) : "",
    visibility: (event?.visibility ?? "public") as Visibility,
  })
  const [types, setTypes] = useState<TT[]>(
    event?.ticketTypes.map((t) => ({
      id: t.id,
      name: t.name,
      price: (t.priceCents / 100).toFixed(2),
      capacity: String(t.capacity),
      maxPerOrder: String(t.maxPerOrder),
      salesStart: toLocal(t.salesStart),
      salesEnd: toLocal(t.salesEnd),
      membersOnly: t.membersOnly,
      sold: t.soldCount,
    })) ?? [newType(0)]
  )
  const [codes, setCodes] = useState(promos)

  const hasPaid = types.some((t) => cents(t.price) > 0)
  const blockedByStripe = hasPaid && !society.chargesEnabled
  const missing = [
    !d.title.trim() && "a title",
    !d.start && "a start time",
    !d.end && "an end time",
    !d.venue.trim() && "a venue",
    types.length === 0 && "at least one ticket type",
    types.some((t) => !t.name.trim()) && "a name for every ticket type",
  ].filter(Boolean) as string[]

  const update = (i: number, patch: Partial<TT>) => setTypes((ts) => ts.map((t, j) => (j === i ? { ...t, ...patch } : t)))

  function save(next?: EventStatus) {
    if (next === "published" && (missing.length || blockedByStripe)) return
    if (next) setStatus(next)
    toast.success(
      next === "published" && status !== "published" ? "Event published" : isNew ? "Draft saved" : "Changes saved",
      { description: "Demo only: nothing is stored until the backend is connected." }
    )
    if (isNew) router.push(`/dashboard/${society.slug}/events`)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Section title="Details">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="group relative block w-full overflow-hidden rounded-xl"
          >
            <EventCover hue={event?.hue ?? 278} src={cover} className="aspect-[3/1]">
              <span className="absolute inset-0 grid place-items-center bg-black/0 text-sm font-medium text-white opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100">
                <span className="flex items-center gap-2">
                  <ImagePlus className="size-4" /> {cover ? "Change cover" : "Upload cover image"}
                </span>
              </span>
            </EventCover>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) setCover(URL.createObjectURL(f))
            }}
          />
          <Field label="Event title" id="title">
            <Input id="title" value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} placeholder="End of Semester Double Feature" />
          </Field>
          <Field label="One-line summary" id="summary" hint="Shown on cards and link previews.">
            <Input id="summary" value={d.summary} onChange={(e) => setD({ ...d, summary: e.target.value })} />
          </Field>
          <Field label="Description" id="description">
            <Textarea id="description" rows={5} value={d.description} onChange={(e) => setD({ ...d, description: e.target.value })} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Starts" id="start">
              <Input id="start" type="datetime-local" value={d.start} onChange={(e) => setD({ ...d, start: e.target.value })} />
            </Field>
            <Field label="Ends" id="end">
              <Input id="end" type="datetime-local" value={d.end} onChange={(e) => setD({ ...d, end: e.target.value })} />
            </Field>
            <Field label="Venue" id="venue">
              <Input id="venue" value={d.venue} onChange={(e) => setD({ ...d, venue: e.target.value })} />
            </Field>
            <Field label="Address" id="address">
              <Input id="address" value={d.address} onChange={(e) => setD({ ...d, address: e.target.value })} />
            </Field>
          </div>
          <Field label="Visibility" id="visibility" hint={d.visibility === "unlisted" ? "Only people with the link can find it." : "Listed on your society page."}>
            <SimpleSelect
              id="visibility"
              value={d.visibility}
              onValueChange={(v) => setD({ ...d, visibility: v })}
              items={[
                { value: "public", label: "Public" },
                { value: "unlisted", label: "Unlisted" },
              ]}
              className="sm:w-56"
            />
          </Field>
        </Section>

        <Section
          title="Tickets"
          description="Buyers see the all-in price, including the booking fee for one ticket."
          action={
            <Button variant="outline" size="sm" onClick={() => setTypes((ts) => [...ts, newType(ts.length)])}>
              <Plus /> Add ticket type
            </Button>
          }
        >
          <div className="space-y-3">
            {types.map((t, i) => {
              const p = cents(t.price)
              const allIn = p + bookingFee(p, p > 0 ? 1 : 0)
              return (
                <div key={t.id} className="rounded-xl border p-4">
                  <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
                    <Field label="Name" id={`${t.id}-name`}>
                      <Input id={`${t.id}-name`} value={t.name} onChange={(e) => update(i, { name: e.target.value })} />
                    </Field>
                    <Field label="Price (AUD)" id={`${t.id}-price`}>
                      <div className="relative">
                        <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                        <Input
                          id={`${t.id}-price`}
                          inputMode="decimal"
                          className="pl-6 tabular"
                          value={t.price}
                          onChange={(e) => update(i, { price: e.target.value.replace(/[^\d.]/g, "") })}
                        />
                      </div>
                    </Field>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Field label="Capacity" id={`${t.id}-cap`}>
                      <Input id={`${t.id}-cap`} inputMode="numeric" className="tabular" value={t.capacity} onChange={(e) => update(i, { capacity: e.target.value.replace(/\D/g, "") })} />
                    </Field>
                    <Field label="Max per order" id={`${t.id}-max`}>
                      <Input id={`${t.id}-max`} inputMode="numeric" className="tabular" value={t.maxPerOrder} onChange={(e) => update(i, { maxPerOrder: e.target.value.replace(/\D/g, "") })} />
                    </Field>
                    <Field label="Sales open" id={`${t.id}-ss`}>
                      <Input id={`${t.id}-ss`} type="datetime-local" value={t.salesStart} onChange={(e) => update(i, { salesStart: e.target.value })} />
                    </Field>
                    <Field label="Sales close" id={`${t.id}-se`}>
                      <Input id={`${t.id}-se`} type="datetime-local" value={t.salesEnd} onChange={(e) => update(i, { salesEnd: e.target.value })} />
                    </Field>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 border-t pt-3">
                    <label className="flex items-center gap-2 text-sm">
                      <Switch checked={t.membersOnly} onCheckedChange={(v) => update(i, { membersOnly: v })} />
                      Members only
                    </label>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Buyer pays </span>
                      <span className="font-semibold tabular">{money(allIn, { free: true })}</span>
                      {p > 0 && <span className="text-muted-foreground"> · you get {money(p)}</span>}
                    </div>
                    {p > 0 && !society.chargesEnabled && (
                      <Pill tone="warning">
                        <Lock className="size-3" /> Needs payments set up
                      </Pill>
                    )}
                    <div className="ml-auto flex items-center gap-3">
                      {t.sold > 0 && <span className="text-xs text-muted-foreground tabular">{t.sold} sold</span>}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Remove ${t.name || "ticket type"}`}
                        disabled={t.sold > 0 || types.length === 1}
                        onClick={() => setTypes((ts) => ts.filter((_, j) => j !== i))}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Section>

        {!isNew && (
          <Section
            title="Promo codes"
            action={<PromoDialog eventId={event.id} onCreate={(p) => setCodes((c) => [...c, p])} />}
          >
            {codes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No promo codes yet.</p>
            ) : (
              <div className="-mx-1 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs text-muted-foreground">
                    <tr>
                      <th className="px-1 py-2 font-medium">Code</th>
                      <th className="px-1 py-2 font-medium">Discount</th>
                      <th className="px-1 py-2 font-medium">Used</th>
                      <th className="px-1 py-2 font-medium">Expires</th>
                      <th className="px-1 py-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {codes.map((c) => {
                      const expired = new Date(c.expiresAt).getTime() < NOW
                      const full = c.usedCount >= c.maxUses
                      return (
                        <tr key={c.id}>
                          <td className="px-1 py-2.5 font-mono font-medium">{c.code}</td>
                          <td className="px-1 py-2.5">{c.kind === "percent" ? `${c.amount}% off` : `${money(c.amount)} off`}</td>
                          <td className="px-1 py-2.5 tabular">
                            {c.usedCount} / {c.maxUses}
                          </td>
                          <td className="px-1 py-2.5">{formatShortDate(c.expiresAt)}</td>
                          <td className="px-1 py-2.5 text-right">
                            {expired ? <Pill>Expired</Pill> : full ? <Pill tone="warning">Used up</Pill> : <Pill tone="success">Active</Pill>}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        )}

        {!isNew && status !== "draft" && status !== "cancelled" && (
          <CancelEventCard
            title={d.title}
            orderCount={orderCount}
            refundTotal={refundTotal}
            onCancel={() => {
              setStatus("cancelled")
              toast.success("Event cancelled", { description: `${orderCount} orders queued for full refunds and buyers emailed (demo).` })
            }}
          />
        )}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start">
        <div className="overflow-hidden rounded-2xl border bg-card">
          <EventCover hue={event?.hue ?? 278} src={cover} className="aspect-[16/9]" />
          <div className="p-4">
            <div className="text-xs text-muted-foreground">
              {d.start ? `${formatDate(fromLocal(d.start))} · ${formatTime(fromLocal(d.start))}` : "Date to be set"}
            </div>
            <div className="mt-1 font-medium">{d.title || "Untitled event"}</div>
            <div className="text-sm text-muted-foreground">{d.venue || "Venue"}</div>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status</span>
            <EventStatusBadge status={status} />
          </div>
          {status === "draft" && (
            <>
              {missing.length > 0 && (
                <p className="text-xs text-muted-foreground">To publish, add {missing.join(", ")}.</p>
              )}
              {blockedByStripe && (
                <p className="flex gap-1.5 text-xs text-[oklch(0.5_0.13_60)]">
                  <AlertTriangle className="size-3.5 shrink-0" />
                  Paid tickets can be published once your society&apos;s payments are set up. Free tickets work now.
                </p>
              )}
              <Button className="w-full" disabled={missing.length > 0 || blockedByStripe} onClick={() => save("published")}>
                Publish event
              </Button>
              <Button variant="outline" className="w-full" onClick={() => save()}>
                Save draft
              </Button>
            </>
          )}
          {status !== "draft" && (
            <Button className="w-full" onClick={() => save()} disabled={status === "cancelled" || status === "ended"}>
              Save changes
            </Button>
          )}
          {!isNew && (
            <p className="truncate text-xs text-muted-foreground">
              /e/{society.slug}/{event.slug}
            </p>
          )}
        </div>
      </aside>
    </div>
  )
}

function newType(i: number): TT {
  return {
    id: `new_${i}_${Math.random().toString(36).slice(2, 7)}`,
    name: i === 0 ? "General admission" : "",
    price: "0.00",
    capacity: "100",
    maxPerOrder: "6",
    salesStart: "",
    salesEnd: "",
    membersOnly: false,
    sold: 0,
  }
}

function Section({
  title,
  description,
  action,
  children,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border bg-card p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function Field({ label, id, hint, children }: { label: string; id: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function PromoDialog({ eventId, onCreate }: { eventId: string; onCreate: (p: PromoCode) => void }) {
  const [open, setOpen] = useState(false)
  const [f, setF] = useState({ code: "", kind: "percent" as "percent" | "fixed", amount: "10", maxUses: "50", expires: "" })
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Plus /> New code
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New promo code</DialogTitle>
          <DialogDescription>Discounts apply to the ticket price. The booking fee is recalculated on the discounted total.</DialogDescription>
        </DialogHeader>
        <form
          id="promo-form"
          className="grid grid-cols-2 gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            onCreate({
              id: `promo_${Date.now()}`,
              eventId,
              code: f.code.toUpperCase(),
              kind: f.kind,
              amount: f.kind === "percent" ? Number(f.amount) : cents(f.amount),
              maxUses: Number(f.maxUses),
              usedCount: 0,
              expiresAt: fromLocal(f.expires),
            })
            setOpen(false)
            toast.success(`Code ${f.code.toUpperCase()} created`)
          }}
        >
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="p-code">Code</Label>
            <Input id="p-code" required className="font-mono uppercase" value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.replace(/\s/g, "") })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-kind">Type</Label>
            <SimpleSelect
              id="p-kind"
              value={f.kind}
              onValueChange={(v) => setF({ ...f, kind: v })}
              items={[
                { value: "percent", label: "Percentage" },
                { value: "fixed", label: "Fixed amount" },
              ]}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-amount">{f.kind === "percent" ? "Percent off" : "Dollars off"}</Label>
            <Input id="p-amount" required inputMode="decimal" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-max">Usage limit</Label>
            <Input id="p-max" required inputMode="numeric" value={f.maxUses} onChange={(e) => setF({ ...f, maxUses: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-exp">Expires</Label>
            <Input id="p-exp" required type="datetime-local" value={f.expires} onChange={(e) => setF({ ...f, expires: e.target.value })} />
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" form="promo-form">
            Create code
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CancelEventCard({
  title,
  orderCount,
  refundTotal,
  onCancel,
}: {
  title: string
  orderCount: number
  refundTotal: number
  onCancel: () => void
}) {
  const [open, setOpen] = useState(false)
  const [confirm, setConfirm] = useState("")
  return (
    <section className="rounded-2xl border border-destructive/30 p-5">
      <h2 className="font-semibold">Cancel event</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Every order is refunded in full, including booking fees, and every buyer is emailed. This can&apos;t be undone.
      </p>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button variant="destructive" className="mt-4" />}>Cancel this event</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel {title}?</DialogTitle>
            <DialogDescription>
              {orderCount} orders will be refunded in full ({money(refundTotal)} in total) and every buyer will be emailed. Type the event name to confirm.
            </DialogDescription>
          </DialogHeader>
          <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder={title} aria-label="Event name" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Keep event
            </Button>
            <Button
              className={cn("bg-destructive text-white hover:bg-destructive/90")}
              disabled={confirm.trim() !== title.trim()}
              onClick={() => {
                setOpen(false)
                onCancel()
              }}
            >
              Cancel and refund everyone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
