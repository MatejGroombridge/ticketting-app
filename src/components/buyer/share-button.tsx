"use client"

import { Share2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export function ShareButton({ title }: { title: string }) {
  async function share() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        // fall through to copy
      }
    }
    await navigator.clipboard.writeText(url)
    toast.success("Link copied")
  }
  return (
    <Button variant="outline" size="sm" onClick={share}>
      <Share2 /> Share
    </Button>
  )
}
