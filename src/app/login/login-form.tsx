"use client"

import { useState } from "react"
import Link from "next/link"
import { Loader2, MailCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm({ next }: { next: string }) {
  const [email, setEmail] = useState("")
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle")

  if (state === "sent") {
    return (
      <div className="mt-6">
        <div className="flex gap-3 rounded-xl bg-brand-soft p-4 text-sm">
          <MailCheck className="size-5 shrink-0 text-brand" />
          <div>
            Check <span className="font-medium">{email}</span> for a sign-in link. It expires in 15 minutes.
          </div>
        </div>
        <Button className="mt-4 h-10 w-full" nativeButton={false} render={<Link href={next} />}>
          Open the link (demo)
        </Button>
        <button className="mt-3 w-full text-sm text-muted-foreground hover:text-foreground" onClick={() => setState("idle")}>
          Use a different email
        </button>
      </div>
    )
  }

  return (
    <form
      className="mt-6 space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        setState("sending")
        setTimeout(() => setState("sent"), 600)
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@student.uni.edu.au"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10"
        />
      </div>
      <Button type="submit" className="h-10 w-full" disabled={state === "sending"}>
        {state === "sending" && <Loader2 className="animate-spin" />} Email me a sign-in link
      </Button>
    </form>
  )
}
