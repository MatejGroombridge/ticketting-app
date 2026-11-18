import type { Metadata } from "next"
import { LookupForm } from "@/components/buyer/lookup-form"

export const metadata: Metadata = { title: "Find my tickets", robots: { index: false } }

export default function LookupPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <h1 className="text-3xl font-semibold">Find my tickets</h1>
      <p className="mt-2 text-muted-foreground">
        Enter the email you bought with and we&apos;ll send you a fresh link to all your tickets.
      </p>
      <LookupForm />
    </div>
  )
}
