import { EventEditor } from "@/components/dashboard/event-editor"
import { ordersFor, promoCodes } from "@/lib/mock-data"
import { requireEvent } from "@/lib/session"

export default async function EditEventPage(props: PageProps<"/dashboard/[society]/events/[event]/edit">) {
  const { society: s, event: e } = await props.params
  const { society, event } = requireEvent(s, e)
  const live = ordersFor(event.id).filter((o) => o.status === "paid" || o.status === "partially_refunded")
  return (
    <EventEditor
      society={society}
      event={event}
      promos={promoCodes.filter((p) => p.eventId === event.id)}
      orderCount={live.length}
      refundTotal={live.reduce((sum, o) => sum + o.totalCents - o.refundedCents, 0)}
    />
  )
}
