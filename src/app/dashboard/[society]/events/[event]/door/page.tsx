import { DoorManager } from "@/components/dashboard/door-manager"
import { doorInvites, ticketsFor } from "@/lib/mock-data"
import { requireEvent } from "@/lib/session"

export default async function DoorPage(props: PageProps<"/dashboard/[society]/events/[event]/door">) {
  const { society: s, event: e } = await props.params
  const { event } = requireEvent(s, e)
  return <DoorManager event={event} invites={doorInvites.filter((d) => d.eventId === event.id)} tickets={ticketsFor(event.id)} />
}
