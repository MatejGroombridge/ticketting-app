import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { EventCover } from "@/components/event-cover"
import { EventCard } from "@/components/buyer/event-card"
import { eventsFor, getSociety } from "@/lib/mock-data"
import { initials } from "@/lib/format"

export async function generateMetadata(props: PageProps<"/s/[society]">): Promise<Metadata> {
  const { society } = await props.params
  return { title: getSociety(society)?.name ?? "Society" }
}

export default async function SocietyPage(props: PageProps<"/s/[society]">) {
  const { society: slug } = await props.params
  const society = getSociety(slug)
  if (!society) notFound()
  const upcoming = eventsFor(society.id).filter((e) => e.status === "published" && e.visibility === "public")

  return (
    <div>
      <EventCover hue={society.hue} className="h-40 sm:h-56" />
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="grid size-20 shrink-0 place-items-center rounded-2xl bg-background text-2xl font-semibold shadow-sm ring-1 ring-border">
            {initials(society.name)}
          </div>
          <div className="pb-1">
            <h1 className="text-2xl font-semibold sm:text-3xl">{society.name}</h1>
            <p className="text-sm text-muted-foreground">{society.university}</p>
          </div>
        </div>
        <p className="mt-5 max-w-2xl text-muted-foreground">{society.description}</p>

        <h2 className="mt-12 text-lg font-semibold">Upcoming events</h2>
        {upcoming.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            No upcoming events right now. Check back soon.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 pb-20 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((e) => (
              <EventCard key={e.id} event={e} society={society} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
