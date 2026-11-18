"use client"

import { useState } from "react"
import Link from "next/link"
import { MoreHorizontal } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { EventCover } from "@/components/event-cover"
import { EventStatusBadge } from "@/components/status-badge"
import { formatDate, money } from "@/lib/format"
import type { TicketEvent } from "@/lib/types"

type Row = { event: TicketEvent; stats: { sold: number; capacity: number; gross: number } }
type Filter = "upcoming" | "drafts" | "past"

export function EventsTable({ rows, societySlug }: { rows: Row[]; societySlug: string }) {
  const [filter, setFilter] = useState<Filter>("upcoming")
  const filtered = rows.filter(({ event: e }) =>
    filter === "upcoming" ? e.status === "published" : filter === "drafts" ? e.status === "draft" : e.status === "ended" || e.status === "cancelled"
  )
  const base = `/dashboard/${societySlug}/events`
  return (
    <div className="space-y-4">
      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
        <TabsList>
          <TabsTrigger value="upcoming">On sale</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="overflow-hidden rounded-2xl border bg-card">
        {filtered.length === 0 && <p className="p-10 text-center text-sm text-muted-foreground">No events here.</p>}
        <ul className="divide-y">
          {filtered.map(({ event: e, stats }) => {
            const pct = Math.round((stats.sold / Math.max(1, stats.capacity)) * 100)
            const href = e.status === "draft" ? `${base}/${e.slug}/edit` : `${base}/${e.slug}/orders`
            return (
              <li key={e.id} className="flex items-center gap-4 p-4">
                <EventCover hue={e.hue} className="hidden size-12 shrink-0 rounded-lg sm:block" />
                <Link href={href} className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium hover:underline">{e.title}</span>
                    <EventStatusBadge status={e.status} />
                    {e.visibility === "unlisted" && <span className="text-xs text-muted-foreground">Unlisted</span>}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(e.startsAt)} · {e.venue}
                  </div>
                </Link>
                <div className="hidden w-36 md:block">
                  <div className="mb-1 text-xs tabular text-muted-foreground">
                    {stats.sold} / {stats.capacity} sold
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className="hidden w-24 text-right text-sm font-medium tabular sm:block">
                  {money(stats.gross, { free: true })}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="Event actions" />}>
                    <MoreHorizontal />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem render={<Link href={`${base}/${e.slug}/orders`} />}>Orders</DropdownMenuItem>
                    <DropdownMenuItem render={<Link href={`${base}/${e.slug}/door`} />}>Door check-in</DropdownMenuItem>
                    <DropdownMenuItem render={<Link href={`${base}/${e.slug}/edit`} />}>Edit event</DropdownMenuItem>
                    {e.status !== "draft" && (
                      <DropdownMenuItem render={<a href={`/e/${societySlug}/${e.slug}`} target="_blank" />}>View public page</DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
