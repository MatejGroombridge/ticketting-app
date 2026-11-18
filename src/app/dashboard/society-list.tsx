"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pill } from "@/components/status-badge"
import { initials, pluralise } from "@/lib/format"

type Item = {
  slug: string
  name: string
  university: string
  role: "owner" | "admin"
  chargesEnabled: boolean
  upcoming: number
  isNew?: boolean
}

export function SocietyList({ initial, openCreate }: { initial: Item[]; openCreate: boolean }) {
  const [items, setItems] = useState(initial)
  const [open, setOpen] = useState(openCreate)
  const [form, setForm] = useState({ name: "", university: "", abn: "" })

  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Your societies</h1>
          <p className="mt-1 text-sm text-muted-foreground">Pick a society to manage its events, orders and payouts.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>
            <Plus /> New society
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create a society</DialogTitle>
              <DialogDescription>You&apos;ll be the owner. You can invite other executives afterwards.</DialogDescription>
            </DialogHeader>
            <form
              id="create-society"
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                setItems((xs) => [
                  ...xs,
                  {
                    slug: form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                    name: form.name,
                    university: form.university,
                    role: "owner",
                    chargesEnabled: false,
                    upcoming: 0,
                    isNew: true,
                  },
                ])
                setOpen(false)
                setForm({ name: "", university: "", abn: "" })
                toast.success(`${form.name} created`, { description: "Next: set up payments in Settings." })
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="soc-name">Society name</Label>
                <Input id="soc-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="soc-uni">University</Label>
                <Input id="soc-uni" required value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="soc-abn">
                  ABN <span className="font-normal text-muted-foreground">(optional)</span>
                </Label>
                <Input id="soc-abn" inputMode="numeric" value={form.abn} onChange={(e) => setForm({ ...form, abn: e.target.value })} />
              </div>
            </form>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" form="create-society">
                Create society
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-8 grid gap-3">
        {items.map((s) => {
          const body = (
            <>
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-sm font-semibold text-brand">
                {initials(s.name)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{s.name}</span>
                  <Pill tone="neutral" dot={false} className="capitalize">
                    {s.role}
                  </Pill>
                </div>
                <div className="mt-0.5 text-sm text-muted-foreground">
                  {s.university} · {pluralise(s.upcoming, "event")} on sale
                </div>
              </div>
              {s.chargesEnabled ? (
                <Pill tone="success">Payments on</Pill>
              ) : (
                <Pill tone="warning">Payments not set up</Pill>
              )}
              {!s.isNew && <ArrowRight className="size-4 text-muted-foreground" />}
            </>
          )
          return s.isNew ? (
            <div key={s.slug} className="flex items-center gap-4 rounded-2xl border bg-card p-4">
              {body}
            </div>
          ) : (
            <Link key={s.slug} href={`/dashboard/${s.slug}`} className="flex items-center gap-4 rounded-2xl border bg-card p-4 transition-colors hover:bg-muted/50">
              {body}
            </Link>
          )
        })}
      </div>
    </>
  )
}
