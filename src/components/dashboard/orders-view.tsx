"use client"

import { useMemo, useState } from "react"
import { Download, MoreHorizontal, Search } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Stat } from "@/components/page-header"
import { OrderStatusBadge, TicketStatusBadge } from "@/components/status-badge"
import { formatDateTime, formatShortDate, formatTime, money, moneyShort } from "@/lib/format"
import type { Order, RefundRequest, Ticket, TicketEvent } from "@/lib/types"

type Props = {
  event: TicketEvent
  orders: Order[]
  tickets: Ticket[]
  requests: RefundRequest[]
  role: "owner" | "admin"
  refundLimitCents: number
  initialTab: string
}

export function OrdersView(props: Props) {
  const { event, role, refundLimitCents } = props
  const [orders, setOrders] = useState(props.orders)
  const [tickets, setTickets] = useState(props.tickets)
  const [requests, setRequests] = useState(props.requests)
  const [q, setQ] = useState("")
  const [tab, setTab] = useState(props.initialTab)
  const [refunding, setRefunding] = useState<Order | null>(null)

  const typeName = (id: string) => event.ticketTypes.find((t) => t.id === id)?.name ?? "—"
  const openRequests = requests.filter((r) => r.status === "open")

  const stats = useMemo(() => {
    const live = tickets.filter((t) => t.status === "valid" || t.status === "checked_in")
    const capacity = event.ticketTypes.reduce((s, t) => s + t.capacity, 0)
    const gross = orders.reduce((s, o) => s + o.subtotalCents - o.discountCents, 0)
    const refunded = orders.reduce((s, o) => s + o.refundedCents, 0)
    const fees = orders.reduce((s, o) => s + o.bookingFeeCents, 0)
    return { sold: live.length, capacity, gross, refunded, fees, net: gross - refunded }
  }, [orders, tickets, event])

  const needle = q.trim().toLowerCase()
  const shownOrders = orders.filter(
    (o) => !needle || o.buyerName.toLowerCase().includes(needle) || o.buyerEmail.includes(needle) || o.id.includes(needle)
  )
  const orderOf = (t: Ticket) => orders.find((o) => o.id === t.orderId)!
  const shownTickets = tickets.filter(
    (t) => !needle || t.attendeeName.toLowerCase().includes(needle) || orderOf(t).buyerEmail.includes(needle)
  )

  function exportCsv() {
    const rows = [
      ["Attendee", "Buyer email", "Ticket type", "Status", "Checked in at", "Order", "Order date"],
      ...tickets.map((t) => {
        const o = orderOf(t)
        return [t.attendeeName, o.buyerEmail, typeName(t.ticketTypeId), t.status, t.checkedInAt ?? "", o.id, o.createdAt]
      }),
    ]
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n")
    const a = document.createElement("a")
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))
    a.download = `${event.slug}-attendees.csv`
    a.click()
  }

  function applyRefund(order: Order, ticketIds: string[], amount: number) {
    setTickets((ts) => ts.map((t) => (ticketIds.includes(t.id) ? { ...t, status: "refunded" } : t)))
    setOrders((os) =>
      os.map((o) => {
        if (o.id !== order.id) return o
        const remaining = tickets.filter((t) => t.orderId === o.id && !ticketIds.includes(t.id) && t.status !== "refunded").length
        return { ...o, refundedCents: o.refundedCents + amount, status: remaining === 0 ? "refunded" : "partially_refunded" }
      })
    )
    setRequests((rs) => rs.map((r) => (r.orderId === order.id ? { ...r, status: "refunded" } : r)))
    toast.success(`Refunded ${money(amount)} to ${order.buyerName}`, { description: "QR codes voided and buyer emailed (demo)." })
  }

  const paidEvent = event.ticketTypes.some((t) => t.priceCents > 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Tickets sold" value={`${stats.sold} / ${stats.capacity}`} hint={`${Math.round((stats.sold / stats.capacity) * 100)}% of capacity`} />
        <Stat label="Ticket revenue" value={moneyShort(stats.net)} hint={stats.refunded ? `${money(stats.refunded)} refunded` : "No refunds"} />
        <Stat label="Orders" value={orders.length} hint={`${orders.filter((o) => o.status === "disputed").length} disputed`} />
        <Stat
          label={paidEvent ? "Booking fees (paid by buyers)" : "Checked in"}
          value={paidEvent ? money(stats.fees) : tickets.filter((t) => t.status === "checked_in").length}
          hint={paidEvent ? "Not deducted from your revenue" : undefined}
        />
      </div>

      <div className="grid gap-3 rounded-2xl border bg-card p-4 sm:grid-cols-3">
        {event.ticketTypes.map((t) => {
          const sold = tickets.filter((x) => x.ticketTypeId === t.id && (x.status === "valid" || x.status === "checked_in")).length
          return (
            <div key={t.id}>
              <div className="flex justify-between text-sm">
                <span className="font-medium">{t.name}</span>
                <span className="text-muted-foreground tabular">
                  {sold} / {t.capacity}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-brand" style={{ width: `${(sold / t.capacity) * 100}%` }} />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {money(t.priceCents, { free: true })} · {t.heldCount} held in checkouts
              </div>
            </div>
          )
        })}
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as string)}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <TabsList>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="attendees">Attendees</TabsTrigger>
            <TabsTrigger value="requests">
              Refund requests
              {openRequests.length > 0 && (
                <span className="grid size-4.5 place-items-center rounded-full bg-brand text-[10px] text-brand-foreground">{openRequests.length}</span>
              )}
            </TabsTrigger>
          </TabsList>
          <div className="flex flex-1 gap-2 sm:justify-end">
            <div className="relative flex-1 sm:max-w-64">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email" className="pl-8" aria-label="Search orders" />
            </div>
            <Button variant="outline" onClick={exportCsv}>
              <Download /> CSV
            </Button>
          </div>
        </div>

        <TabsContent value="orders" className="mt-4">
          <div className="overflow-hidden rounded-2xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Buyer</TableHead>
                  <TableHead>Tickets</TableHead>
                  <TableHead className="hidden md:table-cell">Placed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {shownOrders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="pl-4">
                      <div className="font-medium">{o.buyerName}</div>
                      <div className="text-xs text-muted-foreground">{o.buyerEmail}</div>
                    </TableCell>
                    <TableCell>
                      {o.items.map((i) => (
                        <div key={i.ticketTypeId} className="text-sm">
                          {i.quantity} × {typeName(i.ticketTypeId)}
                        </div>
                      ))}
                      {o.promoCode && <div className="font-mono text-xs text-muted-foreground">{o.promoCode}</div>}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">{formatDateTime(o.createdAt)}</TableCell>
                    <TableCell>
                      <OrderStatusBadge status={o.status} />
                    </TableCell>
                    <TableCell className="text-right tabular">
                      <div>{money(o.totalCents, { free: true })}</div>
                      {o.refundedCents > 0 && <div className="text-xs text-muted-foreground">−{money(o.refundedCents)}</div>}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Order actions" />}>
                          <MoreHorizontal />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem render={<a href={`/t/${o.token}`} target="_blank" />}>View tickets</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.success(`Tickets re-sent to ${o.buyerEmail}`)}>Resend tickets</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            disabled={o.totalCents === 0 || o.status === "refunded" || o.status === "disputed"}
                            onClick={() => setRefunding(o)}
                          >
                            Refund…
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {shownOrders.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">No orders match.</p>}
          </div>
        </TabsContent>

        <TabsContent value="attendees" className="mt-4">
          <div className="overflow-hidden rounded-2xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Attendee</TableHead>
                  <TableHead>Ticket</TableHead>
                  <TableHead className="hidden sm:table-cell">Buyer</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shownTickets.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="pl-4 font-medium">{t.attendeeName}</TableCell>
                    <TableCell>{typeName(t.ticketTypeId)}</TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">{orderOf(t).buyerEmail}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TicketStatusBadge status={t.status} />
                        {t.checkedInAt && <span className="text-xs text-muted-foreground">{formatTime(t.checkedInAt)}</span>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="requests" className="mt-4">
          {requests.length === 0 ? (
            <p className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">No refund requests.</p>
          ) : (
            <div className="space-y-3">
              {requests.map((r) => {
                const o = orders.find((x) => x.id === r.orderId)!
                return (
                  <div key={r.id} className="flex flex-col gap-4 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{o.buyerName}</span>
                        <span className="text-xs text-muted-foreground">{formatShortDate(r.createdAt)}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">&ldquo;{r.reason}&rdquo;</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {o.items.map((i) => `${i.quantity} × ${typeName(i.ticketTypeId)}`).join(", ")} · {money(o.totalCents)}
                      </p>
                    </div>
                    {r.status === "open" ? (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setRequests((rs) => rs.map((x) => (x.id === r.id ? { ...x, status: "declined" } : x)))
                            toast("Request declined", { description: `${o.buyerName} has been emailed.` })
                          }}
                        >
                          Decline
                        </Button>
                        <Button onClick={() => setRefunding(o)}>Refund…</Button>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground capitalize">{r.status}</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <RefundDialog
        order={refunding}
        tickets={refunding ? tickets.filter((t) => t.orderId === refunding.id) : []}
        typeName={typeName}
        limit={role === "owner" ? Infinity : refundLimitCents}
        onClose={() => setRefunding(null)}
        onConfirm={applyRefund}
      />
    </div>
  )
}

function RefundDialog({
  order,
  tickets,
  typeName,
  limit,
  onClose,
  onConfirm,
}: {
  order: Order | null
  tickets: Ticket[]
  typeName: (id: string) => string
  limit: number
  onClose: () => void
  onConfirm: (o: Order, ids: string[], amount: number) => void
}) {
  const refundable = tickets.filter((t) => t.status === "valid")
  const [picked, setPicked] = useState<string[] | null>(null)
  const selected = picked ?? refundable.map((t) => t.id)
  if (!order) return null
  // Ticket price after discount, per ticket. The booking fee is kept unless the event is cancelled.
  const perTicket = Math.floor((order.subtotalCents - order.discountCents) / Math.max(1, tickets.length))
  const amount = perTicket * selected.length
  const overLimit = amount > limit

  return (
    <Dialog
      open={!!order}
      onOpenChange={(o) => {
        if (!o) {
          onClose()
          setPicked(null)
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Refund {order.buyerName}</DialogTitle>
          <DialogDescription>
            Refunds return the ticket price and void the selected QR codes. The {money(order.bookingFeeCents)} booking fee isn&apos;t refunded.
          </DialogDescription>
        </DialogHeader>
        <div className="divide-y rounded-xl border">
          {tickets.map((t) => {
            const can = t.status === "valid"
            return (
              <label key={t.id} className="flex items-center gap-3 p-3 text-sm">
                <Checkbox
                  disabled={!can}
                  checked={can && selected.includes(t.id)}
                  onCheckedChange={(v) => setPicked(v ? [...selected, t.id] : selected.filter((x) => x !== t.id))}
                />
                <span className="flex-1">
                  {t.attendeeName}
                  <span className="text-muted-foreground"> · {typeName(t.ticketTypeId)}</span>
                </span>
                {can ? <span className="tabular">{money(perTicket)}</span> : <TicketStatusBadge status={t.status} />}
              </label>
            )
          })}
        </div>
        <div className="flex justify-between text-sm font-medium">
          <span>Refund total</span>
          <span className="tabular">{money(amount)}</span>
        </div>
        {overLimit && (
          <p className="text-sm text-destructive">
            This is over your refund limit of {money(limit)}. Ask the society owner to process it.
          </p>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onClose()
              setPicked(null)
            }}
          >
            Cancel
          </Button>
          <Button
            disabled={selected.length === 0 || overLimit}
            onClick={() => {
              onConfirm(order, selected, amount)
              onClose()
              setPicked(null)
            }}
          >
            Refund {money(amount)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
