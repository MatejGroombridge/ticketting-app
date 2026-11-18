import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { EventsTable } from "@/components/dashboard/events-table"
import { eventStats, eventsFor } from "@/lib/mock-data"
import { requireSociety } from "@/lib/session"

export default async function EventsPage(props: PageProps<"/dashboard/[society]/events">) {
  const { society: slug } = await props.params
  const { society } = requireSociety(slug)
  const rows = eventsFor(society.id).map((e) => ({ event: e, stats: eventStats(e) }))
  return (
    <div className="space-y-6">
      <PageHeader
        title="Events"
        actions={
          <Button nativeButton={false} render={<Link href={`/dashboard/${slug}/events/new`} />}>
            <Plus /> New event
          </Button>
        }
      />
      <EventsTable rows={rows} societySlug={slug} />
    </div>
  )
}
