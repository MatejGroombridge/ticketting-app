import Link from "next/link"
import { ChevronLeft, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EventStatusBadge } from "@/components/status-badge"
import { EventTabs } from "@/components/dashboard/event-tabs"
import { formatDate, formatTime } from "@/lib/format"
import { requireEvent } from "@/lib/session"

export default async function EventLayout(props: LayoutProps<"/dashboard/[society]/events/[event]">) {
  const { society: s, event: e } = await props.params
  const { society, event } = requireEvent(s, e)
  const base = `/dashboard/${society.slug}/events/${event.slug}`
  return (
    <div className="space-y-6">
      <div>
        <Link href={`/dashboard/${society.slug}/events`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="size-4" /> Events
        </Link>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold">{event.title}</h1>
              <EventStatusBadge status={event.status} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatDate(event.startsAt)} · {formatTime(event.startsAt)} · {event.venue}
            </p>
          </div>
          {event.status !== "draft" && (
            <Button variant="outline" size="sm" nativeButton={false} render={<a href={`/e/${society.slug}/${event.slug}`} target="_blank" />}>
              <ExternalLink /> Public page
            </Button>
          )}
        </div>
        <EventTabs
          className="mt-5"
          tabs={[
            { href: `${base}/orders`, label: "Orders" },
            { href: `${base}/door`, label: "Door check-in" },
            { href: `${base}/edit`, label: "Edit event" },
          ]}
        />
      </div>
      {props.children}
    </div>
  )
}
