"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { CalendarDays, ChevronsUpDown, ExternalLink, LayoutGrid, Menu, Plus, Settings, Users } from "lucide-react"
import { Logo } from "@/components/logo"
import { UserMenu } from "@/components/dashboard/user-menu"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { initials } from "@/lib/format"
import { cn } from "@/lib/utils"

type Soc = { slug: string; name: string; university: string; role: "owner" | "admin" }

export function Sidebar({ society, all }: { society: Soc; all: Soc[] }) {
  return (
    <>
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r bg-sidebar lg:flex">
        <SidebarBody society={society} all={all} />
      </aside>
      <MobileBar society={society} all={all} />
    </>
  )
}

function MobileBar({ society, all }: { society: Soc; all: Soc[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Open menu" />}>
          <Menu />
        </SheetTrigger>
        <SheetContent side="left" className="w-72 gap-0 p-0" showCloseButton={false}>
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarBody society={society} all={all} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <span className="truncate font-medium">{society.name}</span>
    </div>
  )
}

function SidebarBody({ society, all, onNavigate }: { society: Soc; all: Soc[]; onNavigate?: () => void }) {
  const path = usePathname()
  const base = `/dashboard/${society.slug}`
  const nav = [
    { href: base, label: "Overview", icon: LayoutGrid, exact: true },
    { href: `${base}/events`, label: "Events", icon: CalendarDays },
    ...(society.role === "owner"
      ? [
          { href: `${base}/members`, label: "Members", icon: Users },
          { href: `${base}/settings`, label: "Settings", icon: Settings },
        ]
      : []),
  ]
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center px-4">
        <Logo href="/dashboard" />
      </div>
      <div className="px-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center gap-2.5 rounded-lg border bg-background p-2 text-left text-sm outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
            <span className="grid size-8 shrink-0 place-items-center rounded-md bg-brand-soft text-xs font-semibold text-brand">
              {initials(society.name)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{society.name}</span>
              <span className="block truncate text-xs text-muted-foreground capitalize">{society.role}</span>
            </span>
            <ChevronsUpDown className="size-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-60">
            <DropdownMenuGroup>
            <DropdownMenuLabel>Your societies</DropdownMenuLabel>
            {all.map((s) => (
              <DropdownMenuItem key={s.slug} render={<Link href={`/dashboard/${s.slug}`} onClick={onNavigate} />}>
                <span className="grid size-6 place-items-center rounded bg-muted text-[10px] font-semibold">{initials(s.name)}</span>
                {s.name}
              </DropdownMenuItem>
            ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/dashboard?create=1" onClick={onNavigate} />}>
              <Plus /> New society
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <nav className="mt-4 flex flex-col gap-0.5 px-3">
        {nav.map((n) => {
          const active = n.exact ? path === n.href : path.startsWith(n.href)
          return (
            <Link
              key={n.href}
              href={n.href}
              onClick={onNavigate}
              className={cn(
                "flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors",
                active ? "bg-background font-medium shadow-sm ring-1 ring-border" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <n.icon className="size-4" />
              {n.label}
            </Link>
          )
        })}
        <a
          href={`/s/${society.slug}`}
          target="_blank"
          className="flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ExternalLink className="size-4" /> Public page
        </a>
      </nav>
      <div className="mt-auto border-t p-3">
        <UserMenu />
      </div>
    </div>
  )
}
