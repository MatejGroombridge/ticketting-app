import Link from "next/link"
import { ArrowRight, BadgeCheck, CalendarClock, QrCode, ScanLine, Users, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FeeComparison } from "@/components/site/fee-comparison"
import { EventCover } from "@/components/event-cover"
import { events, getSocietyById } from "@/lib/mock-data"
import { formatShortDate } from "@/lib/format"

const FEATURES = [
  { icon: Wallet, title: "One fee per order", body: "Groups of friends pay one small booking fee, not one per ticket. The fee is shown upfront, always." },
  { icon: BadgeCheck, title: "Member pricing", body: "Upload your member list or approve your uni email domain. Members get their price automatically." },
  { icon: QrCode, title: "Tickets without an app", body: "Buyers get a link with a QR code per ticket. Apple Pay and Google Pay at checkout." },
  { icon: ScanLine, title: "Door check-in on any phone", body: "Share a link with volunteers. They scan from their browser, no access to money." },
  { icon: Users, title: "Built for handovers", body: "Several admins per society, and a clean ownership transfer when the exec changes each year." },
  { icon: CalendarClock, title: "Paid out after the event", body: "Money lands in your society's account automatically, two days after the event ends." },
]

export default function Home() {
  const featured = events.filter((e) => e.status === "published" && e.visibility === "public").slice(0, 3)
  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-40 h-[480px] bg-[radial-gradient(60%_60%_at_50%_0%,var(--brand-soft),transparent)]"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pt-16 pb-20 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-24">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-success" />
              For Australian university clubs and societies
            </p>
            <h1 className="text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">
              The lowest booking fee for your society&apos;s events.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              One small fee per order, not per ticket. Free events cost nothing. Set up in minutes and get
              paid straight to your society&apos;s bank account.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" className="h-11 px-5" nativeButton={false} render={<Link href="/login?next=start" />}>
                Start selling <ArrowRight />
              </Button>
              <Button size="lg" variant="outline" className="h-11 px-5" nativeButton={false} render={<Link href="/pricing" />}>
                See how the fee works
              </Button>
            </div>
          </div>
          <FeeComparison />
        </div>
      </section>

      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="max-w-xl text-3xl font-semibold">Everything a society exec needs on the night, nothing they don&apos;t.</h2>
          <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title}>
                <div className="mb-4 grid size-9 place-items-center rounded-lg bg-background ring-1 ring-border">
                  <f.icon className="size-4.5 text-brand" />
                </div>
                <h3 className="font-medium">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-3xl font-semibold">On sale now</h2>
          <Link href="/s/harbour-film" className="text-sm text-muted-foreground hover:text-foreground">
            View society page →
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((e) => {
            const soc = getSocietyById(e.societyId)
            return (
              <Link key={e.id} href={`/e/${soc.slug}/${e.slug}`} className="group">
                <EventCover hue={e.hue} className="aspect-[16/10] rounded-xl transition-transform duration-300 group-hover:scale-[1.01]" />
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground">
                    {formatShortDate(e.startsAt)} · {soc.name}
                  </p>
                  <h3 className="mt-0.5 font-medium group-hover:underline">{e.title}</h3>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-foreground px-6 py-14 text-background sm:px-12">
          <div
            aria-hidden
            className="absolute -right-24 -bottom-24 size-80 rounded-full bg-brand opacity-50 blur-3xl"
          />
          <div className="relative max-w-xl">
            <h2 className="text-3xl font-semibold">Your next event, ticketed in ten minutes.</h2>
            <p className="mt-3 text-background/70">
              Create your society, connect a bank account through Stripe, and share your event link.
            </p>
            <Button
              size="lg"
              className="mt-8 h-11 bg-background px-5 text-foreground hover:bg-background/90"
              nativeButton={false}
              render={<Link href="/login?next=start" />}
            >
              Start selling <ArrowRight />
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
