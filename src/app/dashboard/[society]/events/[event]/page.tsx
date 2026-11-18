import { redirect } from "next/navigation"

export default async function EventIndex(props: PageProps<"/dashboard/[society]/events/[event]">) {
  const { society, event } = await props.params
  redirect(`/dashboard/${society}/events/${event}/orders`)
}
