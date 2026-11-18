import { notFound } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { SettingsView } from "@/components/dashboard/settings-view"
import { auditLog, team } from "@/lib/mock-data"
import { requireSociety } from "@/lib/session"

export default async function SettingsPage(props: PageProps<"/dashboard/[society]/settings">) {
  const { society: slug } = await props.params
  const { society, role } = requireSociety(slug)
  if (role !== "owner") notFound()
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" />
      <SettingsView
        society={society}
        team={team[society.id] ?? []}
        audit={auditLog.filter((a) => a.societyId === society.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))}
      />
    </div>
  )
}
