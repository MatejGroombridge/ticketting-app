import type { Metadata } from "next"
import { TicketView } from "@/components/buyer/ticket-view"
import { SessionOrder } from "@/components/buyer/session-order"
import { getEventById, getOrderByToken, getSocietyById, ticketsForOrder } from "@/lib/mock-data"

export const metadata: Metadata = { title: "Your tickets", robots: { index: false, follow: false } }

export default async function TicketsPage(props: PageProps<"/t/[orderToken]">) {
  const { orderToken } = await props.params
  const sp = await props.searchParams
  const order = getOrderByToken(orderToken)
  const event = order && getEventById(order.eventId)
  if (!order || !event) return <SessionOrder token={orderToken} isNew={sp.new === "1"} />
  return (
    <TicketView
      event={event}
      society={getSocietyById(event.societyId)}
      order={order}
      tickets={ticketsForOrder(order.id)}
    />
  )
}
