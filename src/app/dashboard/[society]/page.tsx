import Link from "next/link"
import { AlertCircle, ArrowRight, CreditCard, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader, Stat } from "@/components/page-header"
import { EventCover } from "@/components/event-cover"
import { EventStatusBadge, OrderStatusBadge, Pill } from "@/components/status-badge"
import { eventStats, eventsFor, getEventById, orders, payouts, refundRequests } from "@/lib/mock-data"
import { formatDate, formatDateTime, formatShortDate, formatTime, money, moneyShort } from "@/lib/format"
import { requireSociety } from "@/lib/session"

export default async function Overview(props: PageProps<"/dashboard/[society]">) {
  const { society: slug } = await props.params
  const { society, role } = requireSociety(slug)
  const all = eventsFor(society.id)
  const upcoming = all.filter((e) => e.status === "published")
  const ids = new Set(all.map((e) => e.id))
  const myOrders = orders.filter((o) => ids.has(o.eventId)).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const sold = upcoming.reduce((s, e) => s + eventStats(e).sold, 0)
  const revenue = all.reduce((s, e) => s + eventStats(e).gross, 0)
  const myPayouts = payouts.filter((p) => p.societyId === society.id)
  const next = myPayouts.filter((p) => p.status === "scheduled").sort((a, b) => a.releaseAt.localeCompare(b.releaseAt))[0]
  const requests = refundRequests.filter((r) => r.status === "open" && ids.has(orders.find((o) => o.id === r.orderId)?.eventId ?? ""))
  const weekAgo = new Date("2026-11-11T00:00:00+11:00").toISOString()
  const thisWeek = myOrders.filter((o) => o.createdAt > weekAgo).length

  return (
    <div className="space-y-8">
      <PageHeader
        title="Overview"
        description={`${society.name} · ${society.university}`}
        actions={
          <Button nativeButton={false} render={<Link href={`/dashboard/${slug}/events/new`} />}>
            <Plus /> New event
          </Button>
        }
      />

      {!society.chargesEnabled && (
        <div className="flex flex-col gap-4 rounded-2xl border border-warning/40 bg-warning/10 p-5 sm:flex-row sm:items-center">
          <CreditCard className="size-5 shrink-0" />
          <div className="flex-1">
            <div className="font-medium">Payments not set up</div>
            <p className="text-sm text-muted-foreground">
              Free events work now. To sell paid tickets, the owner needs to connect a bank account through Stripe. It takes about five minutes.
            </p>
          </div>
          {role === "owner" ? (
            <Button nativeButton={false} render={<Link href={`/dashboard/${slug}/settings#payments`} />}>
              Set up payments
            </Button>
          ) : (
            <span className="text-sm text-muted-foreground">Ask your society owner to finish setup.</span>
          )}
        </div>
      )}

      {requests.length > 0 && (
        <Link
          href={`/dashboard/${slug}/events/${getEventById(orders.find((o) => o.id === requests[0]!.orderId)!.eventId)!.slug}/orders?tab=requests`}
          className="flex items-center gap-3 rounded-2xl border bg-card p-4 text-sm transition-colors hover:bg-muted/50"
        >
          <AlertCircle className="size-4 text-brand" />
          <span className="flex-1">
            <span className="font-medium">{requests.length} refund requests</span>{" "}
            <span className="text-muted-foreground">waiting for a decision</span>
          </span>
          <ArrowRight className="size-4 text-muted-foreground" />
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Tickets sold · upcoming" value={sold} hint={`${thisWeek} orders this week`} />
        <Stat label="Ticket revenue · all time" value={moneyShort(revenue)} hint="After refunds, before payout" />
        <Stat
          label="Next payout"
          value={next ? moneyShort(next.amountCents) : "—"}
          hint={next ? `Releases ${formatShortDate(next.releaseAt)}` : "No events awaiting payout"}
        />
        <Stat label="Events on sale" value={upcoming.length} hint={`${all.filter((e) => e.status === "draft").length} drafts`} />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Upcoming events</h2>
          <Link href={`/dashboard/${slug}/events`} className="text-sm text-muted-foreground hover:text-foreground">
            All events →
          </Link>
        </div>
        <div className="divide-y overflow-hidden rounded-2xl border bg-card">
          {upcoming.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">Nothing on sale. Create your first event.</p>}
          {upcoming.map((e) => {
            const st = eventStats(e)
            const pct = Math.round((st.sold / st.capacity) * 100)
            return (
              <Link
                key={e.id}
                href={`/dashboard/${slug}/events/${e.slug}/orders`}
                className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/40"
              >
                <EventCover hue={e.hue} className="hidden size-12 shrink-0 rounded-lg sm:block" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{e.title}</span>
                    <EventStatusBadge status={e.status} />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(e.startsAt)} · {formatTime(e.startsAt)}
                  </div>
                </div>
                <div className="hidden w-40 sm:block">
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="tabular">
                      {st.sold} / {st.capacity}
                    </span>
                    <span className="text-muted-foreground">{pct}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className="w-20 text-right text-sm font-medium tabular">{money(st.gross, { free: true })}</div>
              </Link>
            )
          })}
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 font-semibold">Recent orders</h2>
          <div className="divide-y overflow-hidden rounded-2xl border bg-card">
            {myOrders.slice(0, 6).map((o) => (
              <div key={o.id} className="flex items-center gap-3 p-3.5 text-sm">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{o.buyerName}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {getEventById(o.eventId)?.title} · {formatDateTime(o.createdAt)}
                  </div>
                </div>
                <OrderStatusBadge status={o.status} />
                <div className="w-16 text-right tabular">{money(o.totalCents, { free: true })}</div>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2 className="mb-3 font-semibold">Payouts</h2>
          <div className="divide-y overflow-hidden rounded-2xl border bg-card">
            {myPayouts.length === 0 && (
              <p className="p-8 text-center text-sm text-muted-foreground">
                Payouts appear here {society.payoutDelayDays} days after each paid event ends.
              </p>
            )}
            {myPayouts.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3.5 text-sm">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{getEventById(p.eventId)?.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.status === "paid" ? "Paid" : "Releases"} {formatDate(p.releaseAt)}
                  </div>
                </div>
                <Pill tone={p.status === "paid" ? "success" : p.status === "failed" ? "danger" : "neutral"} className="capitalize">
                  {p.status.replace("_", " ")}
                </Pill>
                <div className="w-20 text-right font-medium tabular">{money(p.amountCents)}</div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Money is held until each event ends, then released after {society.payoutDelayDays} days.
          </p>
        </section>
      </div>
    </div>
  )
}
