import type { Metadata, Viewport } from "next"
import { Clock } from "lucide-react"
import { DoorScanner } from "@/components/door/door-scanner"
import { getDoorInvite, getEventById, orders, tickets } from "@/lib/mock-data"
import { formatDateTime } from "@/lib/format"
import { NOW } from "@/lib/clock"

export const metadata: Metadata = { title: "Door check-in", robots: { index: false, follow: false } }
export const viewport: Viewport = { themeColor: "#0a0a0a" }

export default async function DoorPage(props: PageProps<"/door/[inviteToken]">) {
  const { inviteToken } = await props.params
  const invite = getDoorInvite(inviteToken)
  const event = invite && getEventById(invite.eventId)

  if (!invite || !event || new Date(invite.expiresAt).getTime() < NOW) {
    return (
      <div className="grid min-h-dvh place-items-center bg-neutral-950 px-6 text-center text-white">
        <div>
          <Clock className="mx-auto size-8 text-white/60" />
          <h1 className="mt-4 text-xl font-semibold">{invite ? "This door link has expired" : "This door link isn't valid"}</h1>
          <p className="mt-2 text-sm text-white/60">
            {invite ? `It stopped working on ${formatDateTime(invite.expiresAt)}.` : "Check you copied the whole link."} Ask an organiser for a new one.
          </p>
        </div>
      </div>
    )
  }

  const emailFor = new Map(orders.map((o) => [o.id, o.buyerEmail]))
  const doorTickets = tickets
    .filter((t) => t.eventId === event.id)
    .map((t) => ({ ...t, buyerEmail: emailFor.get(t.orderId) ?? "" }))
  const otherEventTokens = tickets.filter((t) => t.eventId !== event.id).slice(0, 50).map((t) => t.qrToken)

  return <DoorScanner event={event} tickets={doorTickets} otherEventTokens={otherEventTokens} label={invite.label} />
}
