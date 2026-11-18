"use client"

import Link from "next/link"
import { LogOut, Shield, Ticket } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { currentUser } from "@/lib/mock-data"
import { initials } from "@/lib/format"

export function UserMenu({ compact }: { compact?: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-2.5 rounded-lg p-1.5 text-left text-sm outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-foreground text-[11px] font-semibold text-background">
          {initials(currentUser.name)}
        </span>
        {!compact && (
          <span className="min-w-0">
            <span className="block truncate font-medium">{currentUser.name}</span>
            <span className="block truncate text-xs text-muted-foreground">{currentUser.email}</span>
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{currentUser.email}</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/dashboard" />}>
          <Ticket /> All societies
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/admin" />}>
          <Shield /> Platform admin
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/" />}>
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
