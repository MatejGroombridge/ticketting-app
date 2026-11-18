import type { Metadata } from "next"
import { Logo } from "@/components/logo"
import { UserMenu } from "@/components/dashboard/user-menu"
import { SocietyList } from "./society-list"
import { eventsFor, getSocietyById, memberships } from "@/lib/mock-data"

export const metadata: Metadata = { title: "Dashboard" }

export default async function DashboardHome(props: PageProps<"/dashboard">) {
  const sp = await props.searchParams
  const items = memberships.map((m) => {
    const s = getSocietyById(m.societyId)
    const upcoming = eventsFor(s.id).filter((e) => e.status === "published").length
    return { slug: s.slug, name: s.name, university: s.university, role: m.role, chargesEnabled: s.chargesEnabled, upcoming }
  })
  return (
    <div className="flex-1 bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Logo href="/dashboard" />
          <div className="w-auto">
            <UserMenu compact />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <SocietyList initial={items} openCreate={sp.create === "1"} />
      </div>
    </div>
  )
}
