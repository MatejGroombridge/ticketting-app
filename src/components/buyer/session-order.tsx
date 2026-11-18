"use client"

import { useSyncExternalStore } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TicketView } from "@/components/buyer/ticket-view"
import { loadDemoOrder } from "@/lib/demo-orders"
import { getEventById, getSocietyById } from "@/lib/mock-data"

const noop = () => () => {}

/** Renders an order created in this browser session (checkout without a backend). */
export function SessionOrder({ token, isNew }: { token: string; isNew: boolean }) {
  const raw = useSyncExternalStore(
    noop,
    () => {
      try {
        return sessionStorage.getItem(`stub:order:${token}`)
      } catch {
        return null
      }
    },
    () => undefined
  )
  if (raw === undefined) return <div className="min-h-[60vh]" />
  const data = raw ? loadDemoOrder(token) : null
  const event = data && getEventById(data.order.eventId)
  if (!data || !event) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-xl font-semibold">We couldn&apos;t find those tickets</h1>
        <p className="mt-2 text-muted-foreground">The link may be incomplete. We can email you a fresh link to all your tickets.</p>
        <Button className="mt-6" nativeButton={false} render={<Link href="/tickets/lookup" />}>
          Find my tickets
        </Button>
      </div>
    )
  }
  return (
    <TicketView
      event={event}
      society={getSocietyById(event.societyId)}
      order={data.order}
      tickets={data.tickets}
      isNew={isNew}
    />
  )
}
