import Link from "next/link"
import { EventCover } from "@/components/event-cover"
import { formatDate, formatTime, monthDay, money } from "@/lib/format"
import { eventStats } from "@/lib/mock-data"
import { bookingFee } from "@/lib/fees"
import type { Society, TicketEvent } from "@/lib/types"

export function EventCard({ event, society }: { event: TicketEvent; society: Society }) {
  const { lowest, sold, capacity } = eventStats(event)
  const { month, day } = monthDay(event.startsAt)
  const from = lowest === 0 ? "Free" : `From ${money(lowest + bookingFee(lowest, 1))}`
  return (
    <Link
      href={`/e/${society.slug}/${event.slug}`}
      className="group flex gap-4 rounded-2xl border bg-card p-3 transition-colors hover:bg-muted/40 sm:flex-col sm:p-0 sm:pb-4"
    >
      <EventCover hue={event.hue} className="size-24 shrink-0 rounded-xl sm:aspect-[16/9] sm:size-auto sm:w-full sm:rounded-b-none">
        <div className="absolute top-2.5 left-2.5 hidden flex-col items-center rounded-lg bg-background/90 px-2 py-1 leading-none shadow-sm backdrop-blur sm:flex">
          <span className="text-[10px] font-semibold text-brand">{month}</span>
          <span className="text-lg font-semibold">{day}</span>
        </div>
      </EventCover>
      <div className="min-w-0 py-1 sm:px-4 sm:py-0">
        <p className="text-xs text-muted-foreground">
          {formatDate(event.startsAt)} · {formatTime(event.startsAt)}
        </p>
        <h3 className="mt-1 line-clamp-2 font-medium group-hover:underline">{event.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{event.venue}</p>
        <p className="mt-2 text-sm font-medium">
          {sold >= capacity ? <span className="text-muted-foreground">Sold out</span> : from}
        </p>
      </div>
    </Link>
  )
}
