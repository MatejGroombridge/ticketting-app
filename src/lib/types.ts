// Frontend types mirroring the spec's data model. Money is always integer cents (AUD),
// times are ISO strings in UTC.

export type Role = "owner" | "admin"

export type Society = {
  id: string
  slug: string
  name: string
  university: string
  abn?: string
  description: string
  stripeAccountId?: string
  chargesEnabled: boolean
  payoutsEnabled: boolean
  status: "active" | "paused"
  payoutDelayDays: number
  refundPolicy: string
  emailDomains: string[]
  /** Hue (0–360) used to generate the society's placeholder artwork */
  hue: number
}

export type TicketType = {
  id: string
  name: string
  description?: string
  priceCents: number
  capacity: number
  soldCount: number
  heldCount: number
  salesStart: string
  salesEnd: string
  maxPerOrder: number
  membersOnly: boolean
}

export type EventStatus = "draft" | "published" | "cancelled" | "ended"
export type Visibility = "public" | "unlisted"

export type TicketEvent = {
  id: string
  societyId: string
  slug: string
  title: string
  summary: string
  description: string
  venue: string
  address: string
  startsAt: string
  endsAt: string
  timezone: string
  visibility: Visibility
  status: EventStatus
  hue: number
  ticketTypes: TicketType[]
}

export type OrderStatus =
  | "pending"
  | "paid"
  | "partially_refunded"
  | "refunded"
  | "expired"
  | "disputed"

export type OrderItem = {
  ticketTypeId: string
  quantity: number
  unitPriceCents: number
}

export type Order = {
  id: string
  /** Unguessable token used in /t/[orderToken] */
  token: string
  eventId: string
  buyerName: string
  buyerEmail: string
  status: OrderStatus
  items: OrderItem[]
  promoCode?: string
  subtotalCents: number
  discountCents: number
  bookingFeeCents: number
  totalCents: number
  stripeFeeCents: number
  refundedCents: number
  createdAt: string
}

export type TicketStatus = "valid" | "checked_in" | "refunded" | "void"

export type Ticket = {
  id: string
  orderId: string
  eventId: string
  ticketTypeId: string
  attendeeName: string
  qrToken: string
  status: TicketStatus
  checkedInAt?: string
}

export type PromoCode = {
  id: string
  eventId: string
  code: string
  kind: "fixed" | "percent"
  /** cents for fixed, whole percent for percent */
  amount: number
  maxUses: number
  usedCount: number
  expiresAt: string
}

export type TeamMember = {
  id: string
  name: string
  email: string
  role: Role
  refundLimitCents: number
  pending?: boolean
}

export type MemberListEntry = {
  identifier: string
  source: "csv" | "domain"
  addedAt: string
  expiresAt?: string
}

export type RefundRequest = {
  id: string
  orderId: string
  reason: string
  createdAt: string
  status: "open" | "refunded" | "declined"
}

export type Payout = {
  id: string
  societyId: string
  eventId: string
  amountCents: number
  status: "scheduled" | "in_transit" | "paid" | "failed"
  releaseAt: string
}

export type Dispute = {
  id: string
  orderId: string
  societyId: string
  amountCents: number
  reason: string
  status: "needs_response" | "under_review" | "won" | "lost"
  evidenceDueBy: string
}

export type LedgerKind =
  | "sale"
  | "booking_fee"
  | "stripe_fee"
  | "connect_fee"
  | "refund"
  | "dispute"
  | "payout"

export type LedgerEntry = {
  id: string
  societyId: string
  orderId?: string
  kind: LedgerKind
  amountCents: number
  stripeObjectId: string
  createdAt: string
}

export type AuditEntry = {
  id: string
  societyId: string
  actor: string
  action: string
  target: string
  createdAt: string
}

export type DoorInvite = {
  id: string
  eventId: string
  token: string
  label: string
  createdAt: string
  expiresAt: string
  scans: number
}
