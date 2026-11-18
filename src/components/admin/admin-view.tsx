"use client"

import { useState } from "react"
import { CheckCircle2, ExternalLink, Search } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Stat } from "@/components/page-header"
import { EventStatusBadge, OrderStatusBadge, Pill } from "@/components/status-badge"
import { NOW } from "@/lib/clock"
import { bookingFee, DEFAULT_FEE_SETTINGS, type FeeSettings } from "@/lib/fees"
import { formatDate, formatDateTime, formatShortDate, money, moneyShort } from "@/lib/format"
import type { Dispute, LedgerEntry, Order, Society, TicketEvent } from "@/lib/types"
import { cn } from "@/lib/utils"

type Props = {
  societies: (Society & { eventCount: number })[]
  events: (TicketEvent & { societyName: string; sold: number; capacity: number })[]
  orders: (Order & { eventTitle: string })[]
  disputes: (Dispute & { buyerName: string; eventTitle: string; societyName: string })[]
  ledger: (LedgerEntry & { societyName: string })[]
  totals: { gmv: number; fees: number; stripe: number; connect: number; accountFees: number }
}

export function AdminView(p: Props) {
  const [societies, setSocieties] = useState(p.societies)
  const [pausedEvents, setPausedEvents] = useState<string[]>([])
  const [q, setQ] = useState("")
  const t = p.totals
  const net = t.fees - t.stripe - t.connect - t.accountFees
  const needle = q.trim().toLowerCase()

  return (
    <Tabs defaultValue="overview">
      <TabsList className="h-auto max-w-full flex-wrap justify-start">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="societies">Societies</TabsTrigger>
        <TabsTrigger value="events">Events</TabsTrigger>
        <TabsTrigger value="orders">Orders</TabsTrigger>
        <TabsTrigger value="disputes">
          Disputes {p.disputes.length > 0 && <span className="rounded-full bg-destructive px-1.5 text-[10px] text-white">{p.disputes.length}</span>}
        </TabsTrigger>
        <TabsTrigger value="ledger">Ledger</TabsTrigger>
        <TabsTrigger value="fees">Fee settings</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6 space-y-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Ticket sales (GMV)" value={moneyShort(t.gmv)} hint="All societies, after discounts" />
          <Stat label="Booking fees collected" value={moneyShort(t.fees)} />
          <Stat label="Stripe and Connect fees" value={moneyShort(t.stripe + t.connect + t.accountFees)} hint="Paid out of booking fees" />
          <Stat
            label="Platform net"
            value={<span className={net < 0 ? "text-destructive" : ""}>{moneyShort(net)}</span>}
            hint={`${((net / Math.max(1, t.fees)) * 100).toFixed(0)}% of fees`}
          />
        </div>
        <div className="flex items-center gap-3 rounded-2xl border bg-card p-4 text-sm">
          <CheckCircle2 className="size-4 text-success" />
          <span className="flex-1">
            <span className="font-medium">Ledger reconciled</span>{" "}
            <span className="text-muted-foreground">against Stripe balance transactions · 18 Nov, 2:00am · 0 mismatches</span>
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Active societies" value={societies.filter((s) => s.status === "active").length} hint={`${societies.filter((s) => s.status === "paused").length} paused`} />
          <Stat label="Events on sale" value={p.events.filter((e) => e.status === "published").length} />
          <Stat label="Open disputes" value={p.disputes.length} hint={p.disputes[0] ? `Next deadline ${formatShortDate(p.disputes[0].evidenceDueBy)}` : undefined} />
        </div>
      </TabsContent>

      <TabsContent value="societies" className="mt-6">
        <Panel>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Society</TableHead>
                <TableHead>Stripe</TableHead>
                <TableHead className="hidden md:table-cell">Events</TableHead>
                <TableHead className="hidden md:table-cell">Payout delay</TableHead>
                <TableHead className="pr-4 text-right">Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {societies.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="pl-4">
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.university}</div>
                  </TableCell>
                  <TableCell>
                    {s.chargesEnabled ? (
                      <Pill tone={s.payoutsEnabled ? "success" : "warning"}>{s.payoutsEnabled ? "Enabled" : "Payouts off"}</Pill>
                    ) : (
                      <Pill>Not set up</Pill>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{s.eventCount}</TableCell>
                  <TableCell className="hidden md:table-cell">{s.payoutDelayDays} days</TableCell>
                  <TableCell className="pr-4 text-right">
                    <Switch
                      checked={s.status === "active"}
                      aria-label={`${s.status === "active" ? "Pause" : "Resume"} ${s.name}`}
                      onCheckedChange={(on) => {
                        setSocieties((xs) => xs.map((x) => (x.id === s.id ? { ...x, status: on ? "active" : "paused" } : x)))
                        toast(on ? `${s.name} resumed` : `${s.name} paused`, { description: on ? undefined : "Sales stopped on all its events." })
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Panel>
      </TabsContent>

      <TabsContent value="events" className="mt-6">
        <Panel>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Event</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="hidden sm:table-cell">Sold</TableHead>
                <TableHead className="pr-4 text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {p.events.map((e) => {
                const paused = pausedEvents.includes(e.id)
                return (
                  <TableRow key={e.id}>
                    <TableCell className="pl-4">
                      <div className="font-medium">{e.title}</div>
                      <div className="text-xs text-muted-foreground">{e.societyName}</div>
                    </TableCell>
                    <TableCell>{paused ? <Pill tone="danger">Paused</Pill> : <EventStatusBadge status={e.status} />}</TableCell>
                    <TableCell className="hidden md:table-cell">{formatDate(e.startsAt)}</TableCell>
                    <TableCell className="hidden tabular sm:table-cell">
                      {e.sold} / {e.capacity}
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      {e.status === "published" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setPausedEvents((xs) => (paused ? xs.filter((x) => x !== e.id) : [...xs, e.id]))
                            toast(paused ? "Sales resumed" : "Sales paused")
                          }}
                        >
                          {paused ? "Resume" : "Pause"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Panel>
      </TabsContent>

      <TabsContent value="orders" className="mt-6 space-y-3">
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search buyer, email or order ID" className="pl-8" aria-label="Search orders" />
        </div>
        <Panel>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Order</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead className="hidden md:table-cell">Event</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Fee</TableHead>
                <TableHead className="pr-4 text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {p.orders
                .filter((o) => !needle || o.buyerName.toLowerCase().includes(needle) || o.buyerEmail.includes(needle) || o.id.includes(needle))
                .slice(0, 60)
                .map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="pl-4">
                      <div className="font-mono text-xs">{o.id}</div>
                      <div className="text-xs text-muted-foreground">{formatDateTime(o.createdAt)}</div>
                    </TableCell>
                    <TableCell>
                      <div>{o.buyerName}</div>
                      <div className="text-xs text-muted-foreground">{o.buyerEmail}</div>
                    </TableCell>
                    <TableCell className="hidden max-w-48 truncate md:table-cell">{o.eventTitle}</TableCell>
                    <TableCell>
                      <OrderStatusBadge status={o.status} />
                    </TableCell>
                    <TableCell className="text-right tabular text-muted-foreground">{money(o.bookingFeeCents)}</TableCell>
                    <TableCell className="pr-4 text-right tabular">{money(o.totalCents, { free: true })}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Panel>
      </TabsContent>

      <TabsContent value="disputes" className="mt-6 space-y-4">
        {p.disputes.length === 0 && <p className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">No open disputes.</p>}
        {p.disputes.map((d) => (
          <DisputeCard key={d.id} d={d} />
        ))}
      </TabsContent>

      <TabsContent value="ledger" className="mt-6">
        <Panel>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">When</TableHead>
                <TableHead>Kind</TableHead>
                <TableHead className="hidden md:table-cell">Society</TableHead>
                <TableHead className="hidden sm:table-cell">Stripe object</TableHead>
                <TableHead className="pr-4 text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {p.ledger.slice(0, 80).map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="pl-4 text-muted-foreground">{formatDateTime(l.createdAt)}</TableCell>
                  <TableCell>
                    <span className="font-mono text-xs">{l.kind}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{l.societyName}</TableCell>
                  <TableCell className="hidden font-mono text-xs text-muted-foreground sm:table-cell">{l.stripeObjectId}</TableCell>
                  <TableCell className={cn("pr-4 text-right tabular", l.amountCents < 0 && "text-muted-foreground")}>{money(l.amountCents)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Panel>
      </TabsContent>

      <TabsContent value="fees" className="mt-6">
        <FeeSettingsForm />
      </TabsContent>
    </Tabs>
  )
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="overflow-hidden rounded-2xl border bg-card">{children}</div>
}

const EVIDENCE = [
  "Order details and receipt email",
  "Ticket QR codes and check-in record",
  "Event page snapshot showing the all-in price",
  "Society refund policy shown at checkout",
  "Any messages with the buyer",
]

function DisputeCard({ d }: { d: Props["disputes"][number] }) {
  const [done, setDone] = useState<number[]>([])
  const days = Math.ceil((new Date(d.evidenceDueBy).getTime() - NOW) / 86_400_000)
  return (
    <div className="rounded-2xl border bg-card">
      <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{money(d.amountCents)}</span>
            <Pill tone="danger">Needs response</Pill>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {d.buyerName} · {d.eventTitle} · {d.societyName}
          </p>
          <p className="mt-1 text-sm">Reason: {d.reason}</p>
        </div>
        <div className="text-sm sm:text-right">
          <div className="font-medium">Evidence due {formatDate(d.evidenceDueBy)}</div>
          <div className={cn("text-muted-foreground", days <= 3 && "text-destructive")}>{days > 0 ? `${days} days left` : "Due today"}</div>
        </div>
      </div>
      <div className="p-5">
        <div className="text-sm font-medium">
          Evidence checklist <span className="font-normal text-muted-foreground">· {done.length}/{EVIDENCE.length}</span>
        </div>
        <ul className="mt-3 space-y-2.5">
          {EVIDENCE.map((e, i) => (
            <li key={e}>
              <label className="flex items-center gap-2.5 text-sm">
                <Checkbox checked={done.includes(i)} onCheckedChange={(v) => setDone((xs) => (v ? [...xs, i] : xs.filter((x) => x !== i)))} />
                <span className={done.includes(i) ? "text-muted-foreground line-through" : ""}>{e}</span>
              </label>
            </li>
          ))}
        </ul>
        <Button variant="outline" size="sm" className="mt-5" nativeButton={false} render={<a href="https://dashboard.stripe.com/disputes" target="_blank" rel="noreferrer" />}>
          Submit in Stripe <ExternalLink />
        </Button>
      </div>
    </div>
  )
}

const FIELDS: { key: keyof FeeSettings; label: string; unit: "rate" | "cents"; hint: string }[] = [
  { key: "ps", label: "Stripe card rate", unit: "rate", hint: "Domestic cards" },
  { key: "fs", label: "Stripe fixed fee", unit: "cents", hint: "Per charge" },
  { key: "pc", label: "Connect payout fee", unit: "rate", hint: "On transferred volume" },
  { key: "a", label: "Account fees per ticket", unit: "cents", hint: "Monthly + payout fees, spread" },
  { key: "mo", label: "Margin per order", unit: "cents", hint: "" },
  { key: "mt", label: "Margin per paid ticket", unit: "cents", hint: "" },
]

function FeeSettingsForm() {
  const [s, setS] = useState<Record<keyof FeeSettings, string>>(
    Object.fromEntries(
      Object.entries(DEFAULT_FEE_SETTINGS).map(([k, v]) => [k, k === "ps" || k === "pc" ? (v * 100).toFixed(2) : String(v)])
    ) as Record<keyof FeeSettings, string>
  )
  const parsed: FeeSettings = {
    ps: Number(s.ps) / 100,
    fs: Number(s.fs),
    pc: Number(s.pc) / 100,
    a: Number(s.a),
    mo: Number(s.mo),
    mt: Number(s.mt),
  }
  const examples = [
    { qty: 1, price: 2000 },
    { qty: 4, price: 1500 },
    { qty: 2, price: 8500 },
  ]
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="rounded-2xl border bg-card p-5">
        <h2 className="font-semibold">Booking fee formula</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Changes apply to new orders only. Every order stores the settings it was charged with.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <Label htmlFor={`fee-${f.key}`}>{f.label}</Label>
              <div className="relative">
                <Input
                  id={`fee-${f.key}`}
                  inputMode="decimal"
                  className="pr-10 tabular"
                  value={s[f.key]}
                  onChange={(e) => setS({ ...s, [f.key]: e.target.value.replace(/[^\d.]/g, "") })}
                />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">
                  {f.unit === "rate" ? "%" : "¢"}
                </span>
              </div>
              {f.hint && <p className="text-xs text-muted-foreground">{f.hint}</p>}
            </div>
          ))}
        </div>
        <div className="mt-6 flex gap-2">
          <Button onClick={() => toast.success("Fee settings saved", { description: "New orders use these rates immediately, no deploy needed." })}>
            Save settings
          </Button>
          <Button
            variant="ghost"
            onClick={() =>
              setS(
                Object.fromEntries(
                  Object.entries(DEFAULT_FEE_SETTINGS).map(([k, v]) => [k, k === "ps" || k === "pc" ? (v * 100).toFixed(2) : String(v)])
                ) as Record<keyof FeeSettings, string>
              )
            }
          >
            Reset to defaults
          </Button>
        </div>
      </div>
      <div className="rounded-2xl border bg-card p-5">
        <h3 className="text-sm font-medium">Preview</h3>
        <ul className="mt-3 divide-y text-sm">
          {examples.map((e) => {
            const fee = bookingFee(e.qty * e.price, e.qty, parsed)
            return (
              <li key={`${e.qty}-${e.price}`} className="flex justify-between py-2.5">
                <span>
                  {e.qty} × {money(e.price)}
                </span>
                <span className="tabular">
                  <span className="font-medium">{money(fee)}</span> fee
                </span>
              </li>
            )
          })}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          Spec check: one $20 ticket is 97¢ with default margins and 72¢ with margins at zero.
        </p>
      </div>
    </div>
  )
}
