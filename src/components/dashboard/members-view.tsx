"use client"

import { useRef, useState } from "react"
import { AtSign, FileUp, Search, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pill } from "@/components/status-badge"
import { formatShortDate, pluralise } from "@/lib/format"
import type { MemberListEntry, Society } from "@/lib/types"

export function MembersView({ society, members: initial }: { society: Society; members: MemberListEntry[] }) {
  const [domains, setDomains] = useState(society.emailDomains)
  const [domainInput, setDomainInput] = useState("")
  const [members, setMembers] = useState(initial)
  const [preview, setPreview] = useState<{ name: string; ids: string[]; dupes: number } | null>(null)
  const [expires, setExpires] = useState("2027-02-28")
  const [q, setQ] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  async function readFile(f: File) {
    const text = await f.text()
    const tokens = text
      .split(/[\s,;]+/)
      .map((s) => s.trim().replace(/^"|"$/g, "").toLowerCase())
      .filter((s) => /^\S+@\S+\.\S+$/.test(s) || /^[a-z]?\d{5,}$/i.test(s))
    const unique = [...new Set(tokens)]
    setPreview({ name: f.name, ids: unique, dupes: tokens.length - unique.length })
  }

  function importList(mode: "add" | "replace") {
    if (!preview) return
    const now = new Date().toISOString()
    const expiresAt = new Date(`${expires}T23:59:00+11:00`).toISOString()
    const incoming = preview.ids.map((identifier) => ({ identifier, source: "csv" as const, addedAt: now, expiresAt }))
    setMembers((m) => {
      if (mode === "replace") return incoming
      const have = new Set(m.map((x) => x.identifier))
      return [...m, ...incoming.filter((x) => !have.has(x.identifier))]
    })
    toast.success(`${pluralise(preview.ids.length, "member")} ${mode === "add" ? "added" : "imported"}`)
    setPreview(null)
  }

  const needle = q.trim().toLowerCase()
  const shown = members.filter((m) => !needle || m.identifier.includes(needle))

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-2">
            <AtSign className="size-4 text-brand" />
            <h2 className="font-semibold">Approved email domains</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Anyone with an email at these domains counts as a member. Useful when every student at your uni gets member pricing.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {domains.length === 0 && <span className="text-sm text-muted-foreground">No domains yet.</span>}
            {domains.map((d) => (
              <span key={d} className="inline-flex h-8 items-center gap-1.5 rounded-lg border bg-muted/50 pr-1 pl-2.5 text-sm">
                @{d}
                <button aria-label={`Remove ${d}`} onClick={() => setDomains((ds) => ds.filter((x) => x !== d))} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                  <X className="size-3.5" />
                </button>
              </span>
            ))}
          </div>
          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              const d = domainInput.trim().replace(/^@/, "").toLowerCase()
              if (d && !domains.includes(d)) setDomains((ds) => [...ds, d])
              setDomainInput("")
            }}
          >
            <Input value={domainInput} onChange={(e) => setDomainInput(e.target.value)} placeholder="student.uni.edu.au" aria-label="Email domain" />
            <Button type="submit" variant="outline" disabled={!domainInput.trim()}>
              Add
            </Button>
          </form>
        </section>

        <section className="rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-2">
            <FileUp className="size-4 text-brand" />
            <h2 className="font-semibold">Upload a member list</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            A CSV of student emails or student IDs, in any column. We only use it to check member pricing.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv,.txt"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) readFile(f)
              e.target.value = ""
            }}
          />
          {preview ? (
            <div className="mt-4 space-y-4 rounded-xl bg-muted/50 p-4">
              <div className="text-sm">
                <span className="font-medium">{preview.name}</span>: found {pluralise(preview.ids.length, "member")}
                {preview.dupes > 0 && <span className="text-muted-foreground"> ({preview.dupes} duplicates skipped)</span>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="exp">Membership expires</Label>
                <Input id="exp" type="date" value={expires} onChange={(e) => setExpires(e.target.value)} className="w-48" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => importList("add")} disabled={preview.ids.length === 0}>
                  Add to list
                </Button>
                <Button variant="outline" onClick={() => importList("replace")} disabled={preview.ids.length === 0}>
                  Replace list
                </Button>
                <Button variant="ghost" onClick={() => setPreview(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="mt-4 flex w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed p-6 text-sm text-muted-foreground transition-colors hover:bg-muted/50"
            >
              <FileUp className="size-5" />
              <span>
                <span className="font-medium text-foreground">Choose a CSV</span> or drop it here
              </span>
            </button>
          )}
        </section>
      </div>

      <section className="rounded-2xl border bg-card">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold">
            Member list <span className="font-normal text-muted-foreground">· {members.length}</span>
          </h2>
          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="pl-8" aria-label="Search members" />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Email or student ID</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="hidden sm:table-cell">Added</TableHead>
              <TableHead className="hidden sm:table-cell">Expires</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {shown.map((m) => (
              <TableRow key={m.identifier}>
                <TableCell className="pl-4 font-mono text-[13px]">{m.identifier}</TableCell>
                <TableCell>
                  <Pill dot={false}>{m.source.toUpperCase()}</Pill>
                </TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">{formatShortDate(m.addedAt)}</TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">{m.expiresAt ? formatShortDate(m.expiresAt) : "—"}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon-sm" aria-label={`Remove ${m.identifier}`} onClick={() => setMembers((xs) => xs.filter((x) => x !== m))}>
                    <Trash2 />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {shown.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">No members{needle ? " match" : " yet"}.</p>}
      </section>
    </div>
  )
}
