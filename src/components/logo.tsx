import Link from "next/link"
import { cn } from "@/lib/utils"
import { site } from "@/lib/config"

export function LogoMark({ className }: { className?: string }) {
  // A ticket stub: rounded rectangle with a notch on each side.
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("size-6", className)}>
      <path
        fill="currentColor"
        d="M5 4h14a2 2 0 0 1 2 2v3.2a2.8 2.8 0 0 0 0 5.6V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3.2a2.8 2.8 0 0 0 0-5.6V6a2 2 0 0 1 2-2Z"
      />
      <path stroke="var(--background)" strokeWidth="1.4" strokeDasharray="1.6 1.6" d="M15 6.5v11" />
    </svg>
  )
}

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2 font-semibold tracking-tight", className)}>
      <LogoMark className="text-brand" />
      <span className="text-[17px]">{site.name}</span>
    </Link>
  )
}
