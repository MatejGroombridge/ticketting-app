"use client"

import { useState } from "react"
import Link from "next/link"
import { Loader2, MailCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LookupForm() {
  const [email, setEmail] = useState("")
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle")

  if (state === "sent") {
    return (
      <div className="mt-8 rounded-2xl border p-6">
        <MailCheck className="size-6 text-brand" />
        <h2 className="mt-3 font-semibold">Check your inbox</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          If {email} has any tickets, a link is on its way. It can take a minute to arrive.
        </p>
        <p className="mt-4 text-sm">
          Just looking around? <Link href="/t/demo" className="underline">Open a demo ticket</Link>
        </p>
      </div>
    )
  }

  return (
    <form
      className="mt-8 space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        setState("sending")
        setTimeout(() => setState("sent"), 700)
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="lookup-email">Email</Label>
        <Input
          id="lookup-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10"
        />
      </div>
      <Button type="submit" className="h-10 w-full" disabled={state === "sending"}>
        {state === "sending" && <Loader2 className="animate-spin" />} Email me a link
      </Button>
    </form>
  )
}
