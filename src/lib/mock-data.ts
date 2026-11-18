// Deterministic mock data standing in for the backend. Nothing here is persisted.
import { bookingFee } from "./fees"
import type {
  AuditEntry,
  Dispute,
  DoorInvite,
  LedgerEntry,
  MemberListEntry,
  Order,
  OrderStatus,
  Payout,
  PromoCode,
  RefundRequest,
  Society,
  TeamMember,
  Ticket,
  TicketEvent,
} from "./types"

// ---------------------------------------------------------------- helpers

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(20261118)
const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)]!
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"
const token = (len = 22) =>
  Array.from({ length: len }, () => ALPHABET[Math.floor(rand() * ALPHABET.length)]).join("")

const FIRST = [
  "Ava", "Liam", "Mia", "Noah", "Zara", "Ethan", "Chloe", "Oscar", "Priya", "Jack",
  "Isla", "Leo", "Ruby", "Hamish", "Mei", "Lucas", "Grace", "Kai", "Sienna", "Arjun",
  "Hannah", "Tom", "Yuki", "Sam", "Olivia", "Daniel", "Amelia", "Finn", "Sofia", "Ben",
]
const LAST = [
  "Nguyen", "Smith", "Patel", "Chen", "Williams", "Kelly", "Singh", "Brown", "Tran",
  "Wilson", "Murphy", "Li", "Taylor", "Ahmed", "Martin", "Wong", "Harris", "Rossi",
]

// ---------------------------------------------------------------- societies

export const currentUser = {
  id: "u_alex",
  name: "Alex Chen",
  email: "alex.chen@student.harbour.edu.au",
}

export const societies: Society[] = [
  {
    id: "soc_film",
    slug: "harbour-film",
    name: "Harbour Film Society",
    university: "Harbour University",
    abn: "51 824 753 556",
    description:
      "Weekly screenings, cult classics and the occasional red-carpet ball. Run by students, for anyone who loves film.",
    stripeAccountId: "acct_1QfilmSoc",
    chargesEnabled: true,
    payoutsEnabled: true,
    status: "active",
    payoutDelayDays: 2,
    refundPolicy:
      "Refunds of the ticket price are available up to 48 hours before the event. The booking fee is non-refundable unless the event is cancelled.",
    emailDomains: ["student.harbour.edu.au"],
    hue: 278,
  },
  {
    id: "soc_robotics",
    slug: "harbour-robotics",
    name: "Harbour Robotics Club",
    university: "Harbour University",
    description: "Hands-on workshops, competition teams and the annual Robot Wars showcase.",
    chargesEnabled: false,
    payoutsEnabled: false,
    status: "active",
    payoutDelayDays: 2,
    refundPolicy: "Contact the club executive for refunds.",
    emailDomains: [],
    hue: 190,
  },
  {
    id: "soc_jazz",
    slug: "bayside-jazz",
    name: "Bayside Jazz Collective",
    university: "Bayside University",
    description: "Live jazz nights and open jam sessions.",
    stripeAccountId: "acct_1QjazzCol",
    chargesEnabled: true,
    payoutsEnabled: true,
    status: "active",
    payoutDelayDays: 3,
    refundPolicy: "No refunds except for cancelled events.",
    emailDomains: ["bayside.edu.au"],
    hue: 30,
  },
  {
    id: "soc_debate",
    slug: "bayside-debating",
    name: "Bayside Debating Society",
    university: "Bayside University",
    description: "Competitive and social debating.",
    stripeAccountId: "acct_1QdebSoc",
    chargesEnabled: true,
    payoutsEnabled: false,
    status: "paused",
    payoutDelayDays: 2,
    refundPolicy: "Refunds up to 24 hours before the event.",
    emailDomains: [],
    hue: 350,
  },
]

/** Societies the signed-in organiser belongs to, with their role. */
export const memberships: { societyId: string; role: "owner" | "admin" }[] = [
  { societyId: "soc_film", role: "owner" },
  { societyId: "soc_robotics", role: "admin" },
]

// ---------------------------------------------------------------- events

const iso = (s: string) => new Date(s).toISOString()

export const events: TicketEvent[] = [
  {
    id: "evt_double",
    societyId: "soc_film",
    slug: "end-of-semester-double-feature",
    title: "End of Semester Double Feature",
    summary: "Two cult classics, free popcorn and the last screening of the year.",
    description:
      "Celebrate the end of exams with back-to-back screenings in the big lecture theatre. Doors open 30 minutes before the first film, popcorn is on us, and there's a short break with a raffle between films.\n\nThe film lineup is announced on our socials the week before. Bring a jumper, the air-con is strong.",
    venue: "Lecture Theatre G04",
    address: "Main Quad, Harbour University",
    startsAt: iso("2026-11-27T18:30:00+11:00"),
    endsAt: iso("2026-11-27T23:00:00+11:00"),
    timezone: "Australia/Sydney",
    visibility: "public",
    status: "published",
    hue: 278,
    ticketTypes: [
      {
        id: "tt_double_member",
        name: "Member",
        description: "For verified Film Society members",
        priceCents: 800,
        capacity: 120,
        soldCount: 0,
        heldCount: 3,
        salesStart: iso("2026-11-01T09:00:00+11:00"),
        salesEnd: iso("2026-11-27T18:00:00+11:00"),
        maxPerOrder: 2,
        membersOnly: true,
      },
      {
        id: "tt_double_general",
        name: "General admission",
        priceCents: 1400,
        capacity: 80,
        soldCount: 0,
        heldCount: 2,
        salesStart: iso("2026-11-01T09:00:00+11:00"),
        salesEnd: iso("2026-11-27T18:00:00+11:00"),
        maxPerOrder: 6,
        membersOnly: false,
      },
      {
        id: "tt_double_bundle",
        name: "Snack bundle",
        description: "General admission plus a drink and choc-top",
        priceCents: 2000,
        capacity: 40,
        soldCount: 0,
        heldCount: 0,
        salesStart: iso("2026-11-01T09:00:00+11:00"),
        salesEnd: iso("2026-11-27T18:00:00+11:00"),
        maxPerOrder: 6,
        membersOnly: false,
      },
    ],
  },
  {
    id: "evt_trivia",
    societyId: "soc_film",
    slug: "movie-trivia-night",
    title: "Movie Trivia Night",
    summary: "Teams of up to six. Prizes for the winners and the best team name.",
    description:
      "Six rounds of film trivia, from blockbusters to obscure arthouse. Come with a team or join one on the night. Free entry, registration required so we can plan seating.",
    venue: "The Union Bar",
    address: "Level 1, Student Union Building, Harbour University",
    startsAt: iso("2026-12-04T18:00:00+11:00"),
    endsAt: iso("2026-12-04T21:00:00+11:00"),
    timezone: "Australia/Sydney",
    visibility: "public",
    status: "published",
    hue: 160,
    ticketTypes: [
      {
        id: "tt_trivia_ga",
        name: "Free registration",
        priceCents: 0,
        capacity: 90,
        soldCount: 0,
        heldCount: 0,
        salesStart: iso("2026-11-10T09:00:00+11:00"),
        salesEnd: iso("2026-12-04T17:00:00+11:00"),
        maxPerOrder: 6,
        membersOnly: false,
      },
    ],
  },
  {
    id: "evt_rooftop",
    societyId: "soc_film",
    slug: "summer-rooftop-cinema",
    title: "Summer Rooftop Cinema: Opening Night",
    summary: "An open-air screening under the stars to kick off O-Week.",
    description:
      "Deck chairs, bean bags and a giant screen on the library rooftop. Food trucks from 6:30pm, film starts at sunset. If it rains we move inside to G04.",
    venue: "Library Rooftop",
    address: "Fisher Library, Harbour University",
    startsAt: iso("2027-02-20T19:30:00+11:00"),
    endsAt: iso("2027-02-20T22:30:00+11:00"),
    timezone: "Australia/Sydney",
    visibility: "public",
    status: "published",
    hue: 25,
    ticketTypes: [
      {
        id: "tt_roof_early",
        name: "Early bird",
        priceCents: 1500,
        capacity: 60,
        soldCount: 0,
        heldCount: 0,
        salesStart: iso("2026-11-15T09:00:00+11:00"),
        salesEnd: iso("2027-01-31T23:59:00+11:00"),
        maxPerOrder: 4,
        membersOnly: false,
      },
      {
        id: "tt_roof_member",
        name: "Member",
        priceCents: 1200,
        capacity: 100,
        soldCount: 0,
        heldCount: 0,
        salesStart: iso("2026-11-15T09:00:00+11:00"),
        salesEnd: iso("2027-02-20T18:00:00+11:00"),
        maxPerOrder: 2,
        membersOnly: true,
      },
      {
        id: "tt_roof_general",
        name: "General admission",
        priceCents: 2200,
        capacity: 140,
        soldCount: 0,
        heldCount: 0,
        salesStart: iso("2027-02-01T09:00:00+11:00"),
        salesEnd: iso("2027-02-20T18:00:00+11:00"),
        maxPerOrder: 6,
        membersOnly: false,
      },
    ],
  },
  {
    id: "evt_ball",
    societyId: "soc_film",
    slug: "film-society-ball-2027",
    title: "Film Society Ball 2027",
    summary: "Black tie, red carpet, three-course dinner.",
    description: "Our annual ball. Details to come.",
    venue: "Dockside Ballroom",
    address: "Darling Harbour",
    startsAt: iso("2027-04-10T18:30:00+10:00"),
    endsAt: iso("2027-04-11T00:00:00+10:00"),
    timezone: "Australia/Sydney",
    visibility: "public",
    status: "draft",
    hue: 330,
    ticketTypes: [
      {
        id: "tt_ball_member",
        name: "Member",
        priceCents: 8500,
        capacity: 150,
        soldCount: 0,
        heldCount: 0,
        salesStart: iso("2027-03-01T09:00:00+11:00"),
        salesEnd: iso("2027-04-03T23:59:00+11:00"),
        maxPerOrder: 2,
        membersOnly: true,
      },
      {
        id: "tt_ball_general",
        name: "Non-member",
        priceCents: 10000,
        capacity: 50,
        soldCount: 0,
        heldCount: 0,
        salesStart: iso("2027-03-01T09:00:00+11:00"),
        salesEnd: iso("2027-04-03T23:59:00+11:00"),
        maxPerOrder: 4,
        membersOnly: false,
      },
    ],
  },
  {
    id: "evt_halloween",
    societyId: "soc_film",
    slug: "halloween-horror-marathon",
    title: "Halloween Horror Marathon",
    summary: "Three horror films, costumes encouraged.",
    description: "Our annual horror marathon. Best costume wins a year of free screenings.",
    venue: "Lecture Theatre G04",
    address: "Main Quad, Harbour University",
    startsAt: iso("2026-10-31T18:00:00+11:00"),
    endsAt: iso("2026-11-01T00:30:00+11:00"),
    timezone: "Australia/Sydney",
    visibility: "public",
    status: "ended",
    hue: 20,
    ticketTypes: [
      {
        id: "tt_hall_member",
        name: "Member",
        priceCents: 600,
        capacity: 100,
        soldCount: 0,
        heldCount: 0,
        salesStart: iso("2026-10-01T09:00:00+10:00"),
        salesEnd: iso("2026-10-31T17:00:00+11:00"),
        maxPerOrder: 2,
        membersOnly: true,
      },
      {
        id: "tt_hall_general",
        name: "General admission",
        priceCents: 1000,
        capacity: 100,
        soldCount: 0,
        heldCount: 0,
        salesStart: iso("2026-10-01T09:00:00+10:00"),
        salesEnd: iso("2026-10-31T17:00:00+11:00"),
        maxPerOrder: 6,
        membersOnly: false,
      },
    ],
  },
  {
    id: "evt_arduino",
    societyId: "soc_robotics",
    slug: "intro-to-arduino",
    title: "Intro to Arduino Workshop",
    summary: "Build your first circuit. Kits provided, no experience needed.",
    description: "A two-hour beginner workshop. We provide the kits and snacks.",
    venue: "Engineering Makerspace",
    address: "Building J12, Harbour University",
    startsAt: iso("2026-12-02T17:00:00+11:00"),
    endsAt: iso("2026-12-02T19:00:00+11:00"),
    timezone: "Australia/Sydney",
    visibility: "public",
    status: "published",
    hue: 190,
    ticketTypes: [
      {
        id: "tt_ard_free",
        name: "Workshop spot",
        priceCents: 0,
        capacity: 30,
        soldCount: 0,
        heldCount: 0,
        salesStart: iso("2026-11-05T09:00:00+11:00"),
        salesEnd: iso("2026-12-02T12:00:00+11:00"),
        maxPerOrder: 1,
        membersOnly: false,
      },
    ],
  },
  {
    id: "evt_robotwars",
    societyId: "soc_robotics",
    slug: "robot-wars-showcase",
    title: "Robot Wars Showcase",
    summary: "Watch student-built robots battle it out.",
    description: "Our annual showcase.",
    venue: "Sports Hall",
    address: "Harbour University",
    startsAt: iso("2027-03-20T14:00:00+11:00"),
    endsAt: iso("2027-03-20T18:00:00+11:00"),
    timezone: "Australia/Sydney",
    visibility: "public",
    status: "draft",
    hue: 210,
    ticketTypes: [
      {
        id: "tt_rw_general",
        name: "General admission",
        priceCents: 1000,
        capacity: 200,
        soldCount: 0,
        heldCount: 0,
        salesStart: iso("2027-02-01T09:00:00+11:00"),
        salesEnd: iso("2027-03-20T12:00:00+11:00"),
        maxPerOrder: 6,
        membersOnly: false,
      },
    ],
  },
]

// ---------------------------------------------------------------- promo codes

export const promoCodes: PromoCode[] = [
  {
    id: "promo_1",
    eventId: "evt_double",
    code: "FINALS20",
    kind: "percent",
    amount: 20,
    maxUses: 50,
    usedCount: 0,
    expiresAt: iso("2026-11-27T18:00:00+11:00"),
  },
  {
    id: "promo_2",
    eventId: "evt_double",
    code: "FRIENDS5",
    kind: "fixed",
    amount: 500,
    maxUses: 30,
    usedCount: 30,
    expiresAt: iso("2026-11-27T18:00:00+11:00"),
  },
  {
    id: "promo_3",
    eventId: "evt_double",
    code: "EARLY10",
    kind: "percent",
    amount: 10,
    maxUses: 100,
    usedCount: 41,
    expiresAt: iso("2026-11-08T23:59:00+11:00"),
  },
  {
    id: "promo_4",
    eventId: "evt_rooftop",
    code: "OWEEK",
    kind: "fixed",
    amount: 300,
    maxUses: 100,
    usedCount: 4,
    expiresAt: iso("2027-02-20T18:00:00+11:00"),
  },
]

// ---------------------------------------------------------------- orders & tickets

export const orders: Order[] = []
export const tickets: Ticket[] = []

function generateOrders(
  event: TicketEvent,
  count: number,
  opts: { start: string; end: string; checkInRate: number; promo?: string }
) {
  const start = new Date(opts.start).getTime()
  const end = new Date(opts.end).getTime()
  for (let i = 0; i < count; i++) {
    const first = pick(FIRST)
    const last = pick(LAST)
    const buyerName = `${first} ${last}`
    const buyerEmail = `${first}.${last}${Math.floor(rand() * 90 + 10)}@${
      rand() > 0.35 ? "student.harbour.edu.au" : "gmail.com"
    }`.toLowerCase()

    const available = event.ticketTypes.filter((t) => t.soldCount < t.capacity - 4)
    const type = pick(available)
    const qty = Math.min(type.maxPerOrder, rand() > 0.55 ? 1 : rand() > 0.4 ? 2 : Math.ceil(rand() * 4))
    type.soldCount += qty

    const subtotal = type.priceCents * qty
    const usePromo = opts.promo && type.priceCents > 0 && rand() > 0.8
    const discount = usePromo ? Math.round(subtotal * 0.2) : 0
    const after = subtotal - discount
    const fee = bookingFee(after, type.priceCents > 0 ? qty : 0)
    const total = after + fee

    let status: OrderStatus = "paid"
    const r = rand()
    if (r > 0.96) status = "refunded"
    else if (r > 0.93 && qty > 1) status = "partially_refunded"

    const orderId = `ord_${event.id.slice(4, 8)}${String(i + 1).padStart(3, "0")}`
    const createdAt = new Date(start + (end - start) * Math.pow(rand(), 0.7)).toISOString()
    const refundedTickets = status === "refunded" ? qty : status === "partially_refunded" ? 1 : 0
    const order: Order = {
      id: orderId,
      token: token(),
      eventId: event.id,
      buyerName,
      buyerEmail,
      status,
      items: [{ ticketTypeId: type.id, quantity: qty, unitPriceCents: type.priceCents }],
      promoCode: usePromo ? opts.promo : undefined,
      subtotalCents: subtotal,
      discountCents: discount,
      bookingFeeCents: fee,
      totalCents: total,
      stripeFeeCents: total > 0 ? Math.round(total * 0.0165 + 30) : 0,
      refundedCents:
        refundedTickets > 0 ? Math.round((after / qty) * refundedTickets) : 0,
      createdAt,
    }
    orders.push(order)

    for (let t = 0; t < qty; t++) {
      const refunded = t < refundedTickets
      const checkedIn = !refunded && rand() < opts.checkInRate
      tickets.push({
        id: `tkt_${orderId.slice(4)}_${t + 1}`,
        orderId,
        eventId: event.id,
        ticketTypeId: type.id,
        attendeeName: t === 0 ? buyerName : `${first}'s guest ${qty > 2 ? t : ""}`.trim(),
        qrToken: token(26),
        status: refunded ? "refunded" : checkedIn ? "checked_in" : "valid",
        checkedInAt: checkedIn
          ? new Date(new Date(event.startsAt).getTime() + rand() * 3_600_000).toISOString()
          : undefined,
      })
    }
    if (refundedTickets > 0) type.soldCount -= refundedTickets
  }
}

const byId = (id: string) => events.find((e) => e.id === id)!

generateOrders(byId("evt_double"), 64, {
  start: "2026-11-01T09:00:00+11:00",
  end: "2026-11-18T09:00:00+11:00",
  checkInRate: 0,
  promo: "FINALS20",
})
generateOrders(byId("evt_trivia"), 31, {
  start: "2026-11-10T09:00:00+11:00",
  end: "2026-11-18T09:00:00+11:00",
  checkInRate: 0,
})
generateOrders(byId("evt_rooftop"), 9, {
  start: "2026-11-15T09:00:00+11:00",
  end: "2026-11-18T09:00:00+11:00",
  checkInRate: 0,
})
generateOrders(byId("evt_halloween"), 72, {
  start: "2026-10-01T09:00:00+10:00",
  end: "2026-10-31T16:00:00+11:00",
  checkInRate: 0.88,
})
generateOrders(byId("evt_arduino"), 17, {
  start: "2026-11-05T09:00:00+11:00",
  end: "2026-11-18T09:00:00+11:00",
  checkInRate: 0,
})

// A stable, easy-to-type demo order for the buyer ticket page.
{
  const demo = orders.find((o) => o.eventId === "evt_double" && o.status === "paid" && o.items[0]!.quantity >= 2)!
  demo.token = "demo"
  demo.buyerName = "Jordan Lee"
  demo.buyerEmail = "jordan.lee@student.harbour.edu.au"
  tickets
    .filter((t) => t.orderId === demo.id)
    .forEach((t, i) => (t.attendeeName = i === 0 ? "Jordan Lee" : `Jordan's guest${i > 1 ? ` ${i}` : ""}`))
}

// One disputed order on the past event.
{
  const o = orders.find((o) => o.eventId === "evt_halloween" && o.status === "paid" && o.totalCents > 0)!
  o.status = "disputed"
}

// ---------------------------------------------------------------- team, members, requests

export const team: Record<string, TeamMember[]> = {
  soc_film: [
    { id: "u_alex", name: "Alex Chen", email: currentUser.email, role: "owner", refundLimitCents: 0 },
    { id: "u_priya", name: "Priya Nair", email: "priya.nair@student.harbour.edu.au", role: "admin", refundLimitCents: 10000 },
    { id: "u_tom", name: "Tom Walsh", email: "tom.walsh@student.harbour.edu.au", role: "admin", refundLimitCents: 5000 },
    { id: "u_mei", name: "Mei Tanaka", email: "mei.tanaka@student.harbour.edu.au", role: "admin", refundLimitCents: 0, pending: true },
  ],
  soc_robotics: [
    { id: "u_sam", name: "Sam Okafor", email: "sam.okafor@student.harbour.edu.au", role: "owner", refundLimitCents: 0 },
    { id: "u_alex", name: "Alex Chen", email: currentUser.email, role: "admin", refundLimitCents: 5000 },
  ],
}

export const memberList: Record<string, MemberListEntry[]> = {
  soc_film: [
    "z5312344", "z5298812", "z5401123", "z5377610",
    "jordan.lee@student.harbour.edu.au", "ruby.wong@gmail.com", "oscar.k@outlook.com",
    "z5299001", "z5356432", "mia.tran@student.harbour.edu.au", "z5410087", "z5388215",
  ].map((identifier, i) => ({
    identifier,
    source: "csv" as const,
    addedAt: iso(`2026-0${2 + (i % 3)}-1${i % 9}T10:00:00+11:00`),
    expiresAt: iso("2027-02-28T23:59:00+11:00"),
  })),
  soc_robotics: [],
}

export const refundRequests: RefundRequest[] = (() => {
  const doubleOrders = orders.filter((o) => o.eventId === "evt_double" && o.status === "paid" && o.token !== "demo")
  return [
    {
      id: "rr_1",
      orderId: doubleOrders[3]!.id,
      reason: "I have an exam rescheduled to that evening, sorry!",
      createdAt: iso("2026-11-17T14:12:00+11:00"),
      status: "open",
    },
    {
      id: "rr_2",
      orderId: doubleOrders[11]!.id,
      reason: "Bought two by mistake, only need one.",
      createdAt: iso("2026-11-16T09:40:00+11:00"),
      status: "open",
    },
  ]
})()

export const doorInvites: DoorInvite[] = [
  {
    id: "door_1",
    eventId: "evt_double",
    token: "demo-door",
    label: "Front door",
    createdAt: iso("2026-11-18T10:00:00+11:00"),
    expiresAt: iso("2026-11-28T23:00:00+11:00"),
    scans: 0,
  },
  {
    id: "door_2",
    eventId: "evt_halloween",
    token: "hallow-door",
    label: "Main entrance",
    createdAt: iso("2026-10-30T10:00:00+11:00"),
    expiresAt: iso("2026-11-02T00:30:00+11:00"),
    scans: 141,
  },
]

// ---------------------------------------------------------------- money

const netForEvent = (eventId: string) =>
  orders
    .filter((o) => o.eventId === eventId)
    .reduce((sum, o) => sum + (o.subtotalCents - o.discountCents) - o.refundedCents, 0)

export const payouts: Payout[] = [
  {
    id: "po_1",
    societyId: "soc_film",
    eventId: "evt_halloween",
    amountCents: netForEvent("evt_halloween"),
    status: "paid",
    releaseAt: iso("2026-11-03T00:30:00+11:00"),
  },
  {
    id: "po_2",
    societyId: "soc_film",
    eventId: "evt_double",
    amountCents: netForEvent("evt_double"),
    status: "scheduled",
    releaseAt: iso("2026-11-29T23:00:00+11:00"),
  },
  {
    id: "po_3",
    societyId: "soc_film",
    eventId: "evt_rooftop",
    amountCents: netForEvent("evt_rooftop"),
    status: "scheduled",
    releaseAt: iso("2027-02-22T22:30:00+11:00"),
  },
]

export const disputes: Dispute[] = orders
  .filter((o) => o.status === "disputed")
  .map((o, i) => ({
    id: `dp_${i + 1}`,
    orderId: o.id,
    societyId: "soc_film",
    amountCents: o.totalCents,
    reason: "Product not received",
    status: "needs_response",
    evidenceDueBy: iso("2026-11-26T23:59:00+11:00"),
  }))

export const ledger: LedgerEntry[] = orders
  .filter((o) => o.totalCents > 0)
  .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  .slice(0, 30)
  .flatMap((o) => {
    const ev = byId(o.eventId)
    const base = { societyId: ev.societyId, orderId: o.id, createdAt: o.createdAt }
    const pi = `pi_${o.token.slice(0, 10)}`
    const entries: LedgerEntry[] = [
      { ...base, id: `le_${o.id}_s`, kind: "sale", amountCents: o.subtotalCents - o.discountCents, stripeObjectId: pi },
      { ...base, id: `le_${o.id}_b`, kind: "booking_fee", amountCents: o.bookingFeeCents, stripeObjectId: pi },
      { ...base, id: `le_${o.id}_f`, kind: "stripe_fee", amountCents: -o.stripeFeeCents, stripeObjectId: `txn_${o.token.slice(2, 12)}` },
      { ...base, id: `le_${o.id}_c`, kind: "connect_fee", amountCents: -Math.round((o.subtotalCents - o.discountCents) * 0.0025), stripeObjectId: `txn_${o.token.slice(4, 14)}` },
    ]
    if (o.refundedCents > 0)
      entries.push({ ...base, id: `le_${o.id}_r`, kind: "refund", amountCents: -o.refundedCents, stripeObjectId: `re_${o.token.slice(1, 11)}` })
    return entries
  })

export const auditLog: AuditEntry[] = [
  { id: "al_1", societyId: "soc_film", actor: "Alex Chen", action: "Invited admin", target: "mei.tanaka@student.harbour.edu.au", createdAt: iso("2026-11-17T20:04:00+11:00") },
  { id: "al_2", societyId: "soc_film", actor: "Priya Nair", action: "Refunded 1 ticket", target: "End of Semester Double Feature", createdAt: iso("2026-11-15T11:22:00+11:00") },
  { id: "al_3", societyId: "soc_film", actor: "Alex Chen", action: "Created door link", target: "Front door", createdAt: iso("2026-11-18T10:00:00+11:00") },
  { id: "al_4", societyId: "soc_film", actor: "Alex Chen", action: "Uploaded member list", target: "12 members", createdAt: iso("2026-11-02T09:15:00+11:00") },
  { id: "al_5", societyId: "soc_film", actor: "Tom Walsh", action: "Published event", target: "Summer Rooftop Cinema: Opening Night", createdAt: iso("2026-11-15T08:58:00+11:00") },
  { id: "al_6", societyId: "soc_film", actor: "Alex Chen", action: "Changed refund limit", target: "Priya Nair → $100.00", createdAt: iso("2026-11-01T16:30:00+11:00") },
]

// ---------------------------------------------------------------- queries

export const getSociety = (slug: string) => societies.find((s) => s.slug === slug)
export const getSocietyById = (id: string) => societies.find((s) => s.id === id)!
export const getEvent = (societyId: string, slug: string) =>
  events.find((e) => e.societyId === societyId && e.slug === slug)
export const getEventById = (id: string) => events.find((e) => e.id === id)
export const eventsFor = (societyId: string) =>
  events
    .filter((e) => e.societyId === societyId)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
export const ordersFor = (eventId: string) =>
  orders.filter((o) => o.eventId === eventId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
export const ticketsFor = (eventId: string) => tickets.filter((t) => t.eventId === eventId)
export const ticketsForOrder = (orderId: string) => tickets.filter((t) => t.orderId === orderId)
export const getOrderByToken = (tok: string) => orders.find((o) => o.token === tok)
export const getDoorInvite = (tok: string) => doorInvites.find((d) => d.token === tok)

export function eventStats(e: TicketEvent) {
  const os = orders.filter((o) => o.eventId === e.id)
  const sold = e.ticketTypes.reduce((s, t) => s + t.soldCount, 0)
  const capacity = e.ticketTypes.reduce((s, t) => s + t.capacity, 0)
  const gross = os.reduce((s, o) => s + o.subtotalCents - o.discountCents - o.refundedCents, 0)
  const fees = os.reduce((s, o) => s + o.bookingFeeCents, 0)
  const checkedIn = tickets.filter((t) => t.eventId === e.id && t.status === "checked_in").length
  const lowest = Math.min(...e.ticketTypes.map((t) => t.priceCents))
  return { sold, capacity, gross, fees, orders: os.length, checkedIn, lowest }
}

export function isMember(society: Society, identifier: string) {
  const id = identifier.trim().toLowerCase()
  if (!id) return false
  if (society.emailDomains.some((d) => id.endsWith(`@${d}`))) return true
  return (memberList[society.id] ?? []).some((m) => m.identifier.toLowerCase() === id)
}

export function findPromo(eventId: string, code: string) {
  return promoCodes.find(
    (p) => p.eventId === eventId && p.code.toLowerCase() === code.trim().toLowerCase()
  )
}
