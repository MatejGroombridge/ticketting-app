import { OrdersView } from "@/components/dashboard/orders-view"
import { currentUser, ordersFor, refundRequests, team, ticketsFor } from "@/lib/mock-data"
import { requireEvent } from "@/lib/session"

export default async function OrdersPage(props: PageProps<"/dashboard/[society]/events/[event]/orders">) {
  const { society: s, event: e } = await props.params
  const sp = await props.searchParams
  const { society, event, role } = requireEvent(s, e)
  const orders = ordersFor(event.id)
  const ids = new Set(orders.map((o) => o.id))
  const me = team[society.id]?.find((m) => m.id === currentUser.id)
  return (
    <OrdersView
      event={event}
      orders={orders}
      tickets={ticketsFor(event.id)}
      requests={refundRequests.filter((r) => ids.has(r.orderId))}
      role={role}
      refundLimitCents={me?.refundLimitCents ?? 0}
      initialTab={typeof sp.tab === "string" ? sp.tab : "orders"}
    />
  )
}
