"use client"

import { useState } from "react"
import { Copy, ExternalLink, Plus, ScanLine, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Pill } from "@/components/status-badge"
import { randomToken } from "@/lib/demo-orders"
import { NOW } from "@/lib/clock"
import { formatDateTime, formatTime } from "@/lib/format"
import type { DoorInvite, Ticket, TicketEvent } from "@/lib/types"

export function DoorManager({ event, invites: initial, tickets }: { event: TicketEvent; invites: DoorInvite[]; tickets: Ticket[] }) {
  const [invites, setInvites] = useState(initial)
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState("")
  const live = tickets.filter((t) => t.status === "valid" || t.status === "checked_in")
  const checked = tickets.filter((t) => t.status === "checked_in")
  const pct = live.length ? Math.round((checked.length / live.length) * 100) : 0
  const expiresAt = new Date(new Date(event.endsAt).getTime() + 24 * 3600 * 1000).toISOString()
  const origin = typeof window === "undefined" ? "" : window.location.origin

  // Check-ins per 15 minutes from doors open, for the arrivals chart.
  const start = new Date(event.startsAt).getTime() - 30 * 60 * 1000
  const buckets = Array.from({ length: 10 }, (_, i) => ({
    at: new Date(start + i * 15 * 60 * 1000).toISOString(),
    n: checked.filter((t) => {
      const ts = new Date(t.checkedInAt!).getTime()
      return ts >= start + i * 900_000 && ts < start + (i + 1) * 900_000
    }).length,
  }))
  const maxB = Math.max(1, ...buckets.map((b) => b.n))

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <section className="rounded-2xl border bg-card p-5">
        <h2 className="text-sm font-medium text-muted-foreground">Checked in</h2>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-4xl font-semibold tabular">{checked.length}</span>
          <span className="text-muted-foreground tabular">of {live.length}</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-6">
          <div className="text-xs text-muted-foreground">Arrivals, every 15 minutes from doors open</div>
          <div className="mt-3 flex h-24 items-end gap-1.5">
            {buckets.map((b) => (
              <div key={b.at} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-sm bg-brand/80"
                  style={{ height: `${(b.n / maxB) * 100}%`, minHeight: b.n ? 4 : 2, opacity: b.n ? 1 : 0.25 }}
                  title={`${b.n} at ${formatTime(b.at)}`}
                />
              </div>
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>{formatTime(buckets[0]!.at)}</span>
            <span>{formatTime(buckets.at(-1)!.at)}</span>
          </div>
          {checked.length === 0 && <p className="mt-3 text-xs text-muted-foreground">Arrivals will show here on the night.</p>}
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold">Door links</h2>
            <p className="text-sm text-muted-foreground">
              Volunteers open a link on their phone to scan tickets. They can&apos;t see money or orders. Links expire 24 hours after the event ends.
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button size="sm" />}>
              <Plus /> New link
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New door link</DialogTitle>
                <DialogDescription>Anyone with this link can check in tickets for this event until {formatDateTime(expiresAt)}.</DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="door-label">Label</Label>
                <Input id="door-label" placeholder="Side entrance" value={label} onChange={(e) => setLabel(e.target.value)} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    const inv: DoorInvite = {
                      id: `door_${Date.now()}`,
                      eventId: event.id,
                      token: randomToken(),
                      label: label || "Door",
                      createdAt: new Date().toISOString(),
                      expiresAt,
                      scans: 0,
                    }
                    setInvites((xs) => [inv, ...xs])
                    setOpen(false)
                    setLabel("")
                    navigator.clipboard?.writeText(`${origin}/door/${inv.token}`)
                    toast.success("Door link created and copied")
                  }}
                >
                  Create link
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <ul className="mt-5 divide-y rounded-xl border">
          {invites.length === 0 && <li className="p-6 text-center text-sm text-muted-foreground">No door links yet.</li>}
          {invites.map((inv) => {
            const expired = new Date(inv.expiresAt).getTime() < NOW
            return (
              <li key={inv.id} className="flex items-center gap-3 p-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted">
                  <ScanLine className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {inv.label} {expired ? <Pill>Expired</Pill> : <Pill tone="success">Active</Pill>}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {inv.scans} scans · expires {formatDateTime(inv.expiresAt)}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Copy link"
                  onClick={() => {
                    navigator.clipboard?.writeText(`${origin}/door/${inv.token}`)
                    toast.success("Link copied")
                  }}
                >
                  <Copy />
                </Button>
                <Button variant="ghost" size="icon-sm" aria-label="Open scanner" nativeButton={false} render={<a href={`/door/${inv.token}`} target="_blank" />}>
                  <ExternalLink />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Revoke link"
                  onClick={() => {
                    setInvites((xs) => xs.filter((x) => x.id !== inv.id))
                    toast("Door link revoked")
                  }}
                >
                  <Trash2 />
                </Button>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
