"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function EventTabs({ tabs, className }: { tabs: { href: string; label: string }[]; className?: string }) {
  const path = usePathname()
  return (
    <nav className={cn("flex gap-1 overflow-x-auto border-b", className)}>
      {tabs.map((t) => {
        const active = path.startsWith(t.href)
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-sm whitespace-nowrap transition-colors",
              active ? "border-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </Link>
        )
      })}
    </nav>
  )
}
