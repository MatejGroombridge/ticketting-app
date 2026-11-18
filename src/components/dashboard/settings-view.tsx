"use client"

import { useState } from "react"
import { CheckCircle2, CreditCard, ExternalLink, Loader2, MailPlus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { SimpleSelect } from "@/components/simple-select"
import { Pill } from "@/components/status-badge"
import { formatDateTime, initials, money } from "@/lib/format"
import type { AuditEntry, Role, Society, TeamMember } from "@/lib/types"

export function SettingsView({ society, team: initialTeam, audit }: { society: Society; team: TeamMember[]; audit: AuditEntry[] }) {
  return (
    <div className="space-y-6">
      <Details society={society} />
      <Payments society={society} />
      <Team team={initialTeam} />
      <Activity audit={audit} />
    </div>
  )
}

function Card({ id, title, description, action, children }: { id?: string; title: string; description?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6 rounded-2xl border bg-card">
      <div className="flex items-start justify-between gap-4 border-b p-5">
        <div>
          <h2 className="font-semibold">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}

function Details({ society }: { society: Society }) {
  const [f, setF] = useState({ name: society.name, university: society.university, abn: society.abn ?? "", description: society.description, refundPolicy: society.refundPolicy })
  return (
    <Card title="Society details">
      <form
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault()
          toast.success("Details saved")
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="s-name">Name</Label>
          <Input id="s-name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="s-uni">University</Label>
          <Input id="s-uni" value={f.university} onChange={(e) => setF({ ...f, university: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="s-abn">
            ABN <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input id="s-abn" value={f.abn} onChange={(e) => setF({ ...f, abn: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="s-slug">Public URL</Label>
          <Input id="s-slug" value={`/s/${society.slug}`} disabled />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="s-desc">About</Label>
          <Textarea id="s-desc" rows={2} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="s-refund">Refund policy</Label>
          <Textarea id="s-refund" rows={2} value={f.refundPolicy} onChange={(e) => setF({ ...f, refundPolicy: e.target.value })} />
          <p className="text-xs text-muted-foreground">Shown on every event page and in confirmation emails.</p>
        </div>
        <div className="sm:col-span-2">
          <Button type="submit">Save details</Button>
        </div>
      </form>
    </Card>
  )
}

function Payments({ society }: { society: Society }) {
  const [state, setState] = useState<"none" | "redirecting" | "verifying" | "enabled">(society.chargesEnabled ? "enabled" : "none")
  const [delay, setDelay] = useState(String(society.payoutDelayDays))

  function onboard() {
    setState("redirecting")
    setTimeout(() => {
      setState("verifying")
      setTimeout(() => {
        setState("enabled")
        toast.success("Payments enabled", { description: "You can now publish paid events." })
      }, 2500)
    }, 1200)
  }

  return (
    <Card id="payments" title="Payments" description="Ticket money goes to your society's Stripe account and is paid out after each event.">
      {state === "enabled" ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="grid size-10 place-items-center rounded-xl bg-success/12">
            <CheckCircle2 className="size-5 text-success" />
          </div>
          <div className="flex-1">
            <div className="font-medium">Stripe connected</div>
            <div className="text-sm text-muted-foreground">
              {society.stripeAccountId ?? "acct_1Qnew"} · charges enabled · payouts enabled
            </div>
          </div>
          <Button variant="outline" nativeButton={false} render={<a href="https://dashboard.stripe.com" target="_blank" rel="noreferrer" />}>
            Stripe dashboard <ExternalLink />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="grid size-10 place-items-center rounded-xl bg-warning/15">
            <CreditCard className="size-5" />
          </div>
          <div className="flex-1">
            <div className="font-medium">{state === "verifying" ? "Waiting for Stripe to verify your details" : "Payments not set up"}</div>
            <div className="text-sm text-muted-foreground">
              {state === "verifying"
                ? "This usually takes a minute. We'll email you when it's done."
                : "You'll need the society's bank account details and the treasurer's ID. Takes about five minutes on Stripe."}
            </div>
          </div>
          <Button onClick={onboard} disabled={state !== "none"}>
            {state !== "none" && <Loader2 className="animate-spin" />}
            {state === "none" ? "Set up payments" : state === "redirecting" ? "Opening Stripe…" : "Verifying…"}
          </Button>
        </div>
      )}
      <div className="mt-6 grid gap-4 border-t pt-5 sm:grid-cols-[1fr_200px] sm:items-center">
        <div>
          <Label htmlFor="delay">Payout delay</Label>
          <p className="mt-0.5 text-sm text-muted-foreground">How long after an event ends before its money is sent to your bank.</p>
        </div>
        <SimpleSelect
          id="delay"
          value={delay}
          onValueChange={(v) => {
            setDelay(v)
            toast.success("Payout delay updated")
          }}
          items={["1", "2", "3", "5", "7"].map((d) => ({ value: d, label: `${d} ${d === "1" ? "day" : "days"} after` }))}
        />
      </div>
    </Card>
  )
}

function Team({ team: initial }: { team: TeamMember[] }) {
  const [team, setTeam] = useState(initial)
  const [invite, setInvite] = useState({ open: false, email: "", role: "admin" as Role, limit: "50" })
  const [transfer, setTransfer] = useState<{ open: boolean; to: string }>({ open: false, to: "" })
  const admins = team.filter((m) => m.role === "admin" && !m.pending)

  return (
    <Card
      title="Team"
      description="Owners manage payments, members and the team. Admins run events and can refund up to their limit."
      action={
        <Dialog open={invite.open} onOpenChange={(open) => setInvite({ ...invite, open })}>
          <DialogTrigger render={<Button size="sm" />}>
            <MailPlus /> Invite
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite an executive</DialogTitle>
              <DialogDescription>They&apos;ll get an email with a sign-in link.</DialogDescription>
            </DialogHeader>
            <form
              id="invite"
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                setTeam((t) => [
                  ...t,
                  {
                    id: `u_${Date.now()}`,
                    name: invite.email.split("@")[0]!.replace(/[._]/g, " "),
                    email: invite.email,
                    role: "admin",
                    refundLimitCents: Math.round(Number(invite.limit) * 100),
                    pending: true,
                  },
                ])
                toast.success(`Invite sent to ${invite.email}`)
                setInvite({ open: false, email: "", role: "admin", limit: "50" })
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="inv-email">Email</Label>
                <Input id="inv-email" type="email" required value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inv-limit">Refund limit per order (AUD)</Label>
                <Input id="inv-limit" inputMode="decimal" value={invite.limit} onChange={(e) => setInvite({ ...invite, limit: e.target.value })} />
                <p className="text-xs text-muted-foreground">Set to 0 to stop this admin issuing refunds.</p>
              </div>
            </form>
            <DialogFooter>
              <Button variant="outline" onClick={() => setInvite({ ...invite, open: false })}>
                Cancel
              </Button>
              <Button type="submit" form="invite">
                Send invite
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <ul className="-my-2 divide-y">
        {team.map((m) => (
          <li key={m.id} className="flex items-center gap-3 py-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold capitalize">{initials(m.name)}</span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-sm font-medium capitalize">
                {m.name}
                {m.pending && <Pill tone="warning">Invited</Pill>}
              </div>
              <div className="truncate text-xs text-muted-foreground">{m.email}</div>
            </div>
            <div className="hidden text-right text-xs text-muted-foreground sm:block">
              {m.role === "owner" ? "Unlimited refunds" : m.refundLimitCents ? `Refunds up to ${money(m.refundLimitCents)}` : "No refunds"}
            </div>
            <Pill tone={m.role === "owner" ? "brand" : "neutral"} dot={false} className="capitalize">
              {m.role}
            </Pill>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Remove ${m.name}`}
              disabled={m.role === "owner"}
              onClick={() => {
                setTeam((t) => t.filter((x) => x.id !== m.id))
                toast(`${m.name} removed`)
              }}
            >
              <Trash2 />
            </Button>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-col gap-3 rounded-xl bg-muted/50 p-4 sm:flex-row sm:items-center">
        <div className="flex-1 text-sm">
          <div className="font-medium">Handing over to next year&apos;s exec?</div>
          <div className="text-muted-foreground">Transfer ownership to another admin. It takes effect once they accept by email.</div>
        </div>
        <Dialog open={transfer.open} onOpenChange={(open) => setTransfer({ ...transfer, open })}>
          <DialogTrigger render={<Button variant="outline" disabled={admins.length === 0} />}>Transfer ownership</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Transfer ownership</DialogTitle>
              <DialogDescription>
                The new owner controls payments, payouts and the team. You&apos;ll stay on as an admin until they remove you.
              </DialogDescription>
            </DialogHeader>
            <SimpleSelect
              value={transfer.to}
              onValueChange={(to) => setTransfer({ ...transfer, to })}
              placeholder="Choose an admin"
              items={admins.map((a) => ({ value: a.id, label: `${a.name} · ${a.email}` }))}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setTransfer({ open: false, to: "" })}>
                Cancel
              </Button>
              <Button
                disabled={!transfer.to}
                onClick={() => {
                  const who = admins.find((a) => a.id === transfer.to)!
                  toast.success(`Transfer request sent to ${who.name}`, { description: "Ownership moves when they accept." })
                  setTransfer({ open: false, to: "" })
                }}
              >
                Send request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  )
}

function Activity({ audit }: { audit: AuditEntry[] }) {
  return (
    <Card title="Activity" description="Every change to money or permissions is logged.">
      <ul className="-my-1 space-y-3">
        {audit.map((a) => (
          <li key={a.id} className="flex gap-3 text-sm">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
            <div className="flex-1">
              <span className="font-medium">{a.actor}</span> <span className="text-muted-foreground">{a.action.toLowerCase()}</span> {a.target}
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">{formatDateTime(a.createdAt)}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
