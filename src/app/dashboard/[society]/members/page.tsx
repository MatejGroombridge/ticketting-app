import { notFound } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { MembersView } from "@/components/dashboard/members-view"
import { memberList } from "@/lib/mock-data"
import { requireSociety } from "@/lib/session"

export default async function MembersPage(props: PageProps<"/dashboard/[society]/members">) {
  const { society: slug } = await props.params
  const { society, role } = requireSociety(slug)
  if (role !== "owner") notFound()
  return (
    <div className="space-y-6">
      <PageHeader title="Members" description="Who gets member pricing and members-only tickets." />
      <MembersView society={society} members={memberList[society.id] ?? []} />
    </div>
  )
}
