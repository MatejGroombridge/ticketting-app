import Link from "next/link"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
          <Link href="/pricing" className="transition-colors hover:text-foreground">
            Pricing
          </Link>
          <Link href="/s/harbour-film" className="transition-colors hover:text-foreground">
            Example society
          </Link>
          <Link href="/tickets/lookup" className="transition-colors hover:text-foreground">
            Find my tickets
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/login" />}>
            Sign in
          </Button>
          <Button size="sm" nativeButton={false} render={<Link href="/login?next=start" />}>
            Start selling
          </Button>
        </div>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Logo className="text-foreground" />
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
          <Link href="/tickets/lookup" className="hover:text-foreground">Find my tickets</Link>
          <Link href="/dashboard" className="hover:text-foreground">Organiser dashboard</Link>
          <Link href="/admin" className="hover:text-foreground">Platform admin</Link>
        </div>
        <p>Made in Australia · Prices in AUD</p>
      </div>
    </footer>
  )
}
