import type { Metadata } from "next"
import { Logo } from "@/components/logo"
import { UserMenu } from "@/components/dashboard/user-menu"
import { AdminView } from "@/components/admin/admin-view"
import { disputes, eventStats, events, getEventById, getSocietyById, ledger, orders, societies } from "@/lib/mock-data"

export const metadata: Metadata = { title: "Platform admin", robots: { index: false } }

export default function AdminPage() {
  const paid = orders.filter((o) => o.totalCents > 0)
  const totals = {
    gmv: paid.reduce((s, o) => s + o.subtotalCents - o.discountCents, 0),
    fees: paid.reduce((s, o) => s + o.bookingFeeCents, 0),
    stripe: paid.reduce((s, o) => s + o.stripeFeeCents, 0),
    connect: paid.reduce((s, o) => s + Math.round((o.subtotalCents - o.discountCents) * 0.0025), 0),
    accountFees: paid.reduce((s, o) => s + o.items.reduce((n, i) => n + i.quantity, 0) * 2, 0),
  }
  return (
    <div className="flex-1 bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Logo href="/admin" />
          <span className="rounded-md bg-foreground px-1.5 py-0.5 text-[11px] font-medium text-background">Admin</span>
          <div className="ml-auto">
            <UserMenu compact />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="mb-6 text-2xl font-semibold">Platform admin</h1>
        <AdminView
          societies={societies.map((s) => ({ ...s, eventCount: events.filter((e) => e.societyId === s.id).length }))}
          events={events.map((e) => ({ ...e, societyName: getSocietyById(e.societyId).name, ...eventStats(e) }))}
          orders={[...orders]
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .map((o) => ({ ...o, eventTitle: getEventById(o.eventId)?.title ?? "" }))}
          disputes={disputes.map((d) => {
            const o = orders.find((x) => x.id === d.orderId)!
            return { ...d, buyerName: o.buyerName, eventTitle: getEventById(o.eventId)?.title ?? "", societyName: getSocietyById(d.societyId).name }
          })}
          ledger={ledger.map((l) => ({ ...l, societyName: getSocietyById(l.societyId).name }))}
          totals={totals}
        />
      </div>
    </div>
  )
}
