import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { EventEditor } from "@/components/dashboard/event-editor"
import { requireSociety } from "@/lib/session"

export default async function NewEventPage(props: PageProps<"/dashboard/[society]/events/new">) {
  const { society: slug } = await props.params
  const { society } = requireSociety(slug)
  return (
    <div className="space-y-6">
      <div>
        <Link href={`/dashboard/${slug}/events`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="size-4" /> Events
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">New event</h1>
      </div>
      <EventEditor society={society} />
    </div>
  )
}
