import { notFound } from "next/navigation"
import { getEvent, getSociety, memberships } from "./mock-data"

/** Server helper: resolves the society (and optionally event) from route params, as the signed-in user. */
export function requireSociety(slug: string) {
  const society = getSociety(slug)
  const m = society && memberships.find((x) => x.societyId === society.id)
  if (!society || !m) notFound()
  return { society, role: m.role }
}

export function requireEvent(societySlug: string, eventSlug: string) {
  const { society, role } = requireSociety(societySlug)
  const event = getEvent(society.id, eventSlug)
  if (!event) notFound()
  return { society, role, event }
}
