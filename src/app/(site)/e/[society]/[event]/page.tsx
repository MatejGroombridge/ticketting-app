import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CalendarDays, MapPin, Share2, ShieldCheck } from "lucide-react"
import { EventCover } from "@/components/event-cover"
import { TicketPicker } from "@/components/buyer/ticket-picker"
import { ShareButton } from "@/components/buyer/share-button"
import { Button } from "@/components/ui/button"
import { bookingFee } from "@/lib/fees"
import { formatDate, formatTimeRange, initials, money } from "@/lib/format"
import { eventStats, getEvent, getSociety } from "@/lib/mock-data"

async function load(props: PageProps<"/e/[society]/[event]">) {
  const { society: s, event: e } = await props.params
  const society = getSociety(s)
  const event = society && getEvent(society.id, e)
  return { society, event }
}

export async function generateMetadata(props: PageProps<"/e/[society]/[event]">): Promise<Metadata> {
  const { event } = await load(props)
  return event ? { title: event.title, description: event.summary } : {}
}

export default async function EventPage(props: PageProps<"/e/[society]/[event]">) {
  const { society, event } = await load(props)
  if (!society || !event || event.status === "draft") notFound()
  const { lowest } = eventStats(event)
  const fromAllIn = lowest + bookingFee(lowest, lowest > 0 ? 1 : 0)

  return (
    <div className="mx-auto max-w-6xl px-0 pb-28 sm:px-6 sm:pt-6 lg:pb-20">
      <EventCover hue={event.hue} className="aspect-[2/1] sm:aspect-[3/1] sm:rounded-2xl">
        {event.status === "cancelled" && (
          <div className="absolute inset-0 grid place-items-center bg-black/50 text-lg font-semibold text-white">
            This event has been cancelled
          </div>
        )}
      </EventCover>

      <div className="mt-6 grid gap-10 px-4 sm:px-0 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          <Link
            href={`/s/${society.slug}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <span className="grid size-6 place-items-center rounded-md bg-muted text-[10px] font-semibold text-foreground">
              {initials(society.name)}
            </span>
            {society.name}
          </Link>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{event.title}</h1>
          <p className="mt-3 text-lg text-muted-foreground">{event.summary}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <InfoItem icon={CalendarDays} title={formatDate(event.startsAt)}>
              {formatTimeRange(event.startsAt, event.endsAt)}
            </InfoItem>
            <InfoItem icon={MapPin} title={event.venue}>
              {event.address}
            </InfoItem>
          </div>

          <div className="mt-10">
            <h2 className="text-lg font-semibold">About this event</h2>
            <div className="mt-3 space-y-4 leading-relaxed text-muted-foreground">
              {event.description.split("\n\n").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>

          <div className="mt-10 rounded-xl border p-5">
            <div className="flex items-center gap-2 font-medium">
              <ShieldCheck className="size-4 text-brand" /> Refund policy
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{society.refundPolicy}</p>
            <p className="mt-2 text-sm text-muted-foreground">If the event is cancelled you get a full refund automatically.</p>
          </div>

          <div className="mt-6 flex gap-2">
            <ShareButton title={event.title} />
            <Button variant="ghost" size="sm" nativeButton={false} render={<Link href={`/s/${society.slug}`} />}>
              More from {society.name}
            </Button>
          </div>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <TicketPicker event={event} society={society} />
        </aside>
      </div>

      {event.status === "published" && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/90 p-3 backdrop-blur-lg lg:hidden">
          <div className="mx-auto flex max-w-xl items-center gap-3">
            <div className="flex-1">
              <div className="text-xs text-muted-foreground">{lowest === 0 ? "Entry" : "From, all-in"}</div>
              <div className="font-semibold tabular">{money(fromAllIn, { free: true })}</div>
            </div>
            <Button className="h-11 px-6" nativeButton={false} render={<a href="#tickets" />}>
              Get tickets
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoItem({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Share2
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-3">
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted">
        <Icon className="size-4.5" />
      </div>
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-sm text-muted-foreground">{children}</div>
      </div>
    </div>
  )
}
