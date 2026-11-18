import { notFound } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { getSociety, getSocietyById, memberships } from "@/lib/mock-data"

export default async function SocietyLayout(props: LayoutProps<"/dashboard/[society]">) {
  const { society: slug } = await props.params
  const society = getSociety(slug)
  const membership = society && memberships.find((m) => m.societyId === society.id)
  if (!society || !membership) notFound()
  const all = memberships.map((m) => {
    const s = getSocietyById(m.societyId)
    return { slug: s.slug, name: s.name, university: s.university, role: m.role }
  })
  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-muted/30 lg:flex-row">
      <Sidebar society={{ slug, name: society.name, university: society.university, role: membership.role }} all={all} />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8">{props.children}</div>
      </main>
    </div>
  )
}
