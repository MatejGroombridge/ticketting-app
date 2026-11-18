import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { CheckoutForm } from "@/components/buyer/checkout-form"
import { decodeSelection } from "@/lib/cart"
import { getEvent, getSociety } from "@/lib/mock-data"

export const metadata: Metadata = { title: "Checkout", robots: { index: false } }

export default async function CheckoutPage(props: PageProps<"/e/[society]/[event]/checkout">) {
  const { society: s, event: e } = await props.params
  const sp = await props.searchParams
  const society = getSociety(s)
  const event = society && getEvent(society.id, e)
  if (!society || !event) notFound()
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

  return (
    <CheckoutForm
      event={event}
      society={society}
      selection={decodeSelection(one(sp.items))}
      promoCode={one(sp.promo)}
      member={one(sp.member)}
    />
  )
}
