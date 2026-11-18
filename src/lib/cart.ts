import { bookingFee } from "./fees"
import { NOW } from "./clock"
import type { PromoCode, TicketEvent, TicketType } from "./types"

export type Selection = Record<string, number>

export function remaining(t: TicketType) {
  return Math.max(0, t.capacity - t.soldCount - t.heldCount)
}

export type Availability =
  | { kind: "available"; left: number }
  | { kind: "soldout" }
  | { kind: "notyet"; opens: string }
  | { kind: "closed" }

export function availability(t: TicketType, now = NOW): Availability {
  if (now < new Date(t.salesStart).getTime()) return { kind: "notyet", opens: t.salesStart }
  if (now > new Date(t.salesEnd).getTime()) return { kind: "closed" }
  const left = remaining(t)
  if (left === 0) return { kind: "soldout" }
  return { kind: "available", left }
}

export function promoError(p: PromoCode | undefined, now = NOW): string | null {
  if (!p) return "We don't recognise that code."
  if (now > new Date(p.expiresAt).getTime()) return "That code has expired."
  if (p.usedCount >= p.maxUses) return "That code has been fully used."
  return null
}

export function summarise(event: TicketEvent, sel: Selection, promo?: PromoCode | null) {
  const lines = event.ticketTypes
    .filter((t) => (sel[t.id] ?? 0) > 0)
    .map((t) => ({ type: t, qty: sel[t.id]!, total: t.priceCents * sel[t.id]! }))
  const qty = lines.reduce((s, l) => s + l.qty, 0)
  const paidQty = lines.filter((l) => l.type.priceCents > 0).reduce((s, l) => s + l.qty, 0)
  const subtotal = lines.reduce((s, l) => s + l.total, 0)
  let discount = 0
  if (promo && subtotal > 0) {
    discount = promo.kind === "percent" ? Math.round((subtotal * promo.amount) / 100) : Math.min(promo.amount, subtotal)
  }
  const after = subtotal - discount
  const fee = bookingFee(after, paidQty)
  return { lines, qty, paidQty, subtotal, discount, fee, total: after + fee }
}

export function encodeSelection(sel: Selection) {
  return Object.entries(sel)
    .filter(([, q]) => q > 0)
    .map(([id, q]) => `${id}:${q}`)
    .join(",")
}

export function decodeSelection(s: string | undefined | null): Selection {
  const out: Selection = {}
  for (const part of (s ?? "").split(",")) {
    const [id, q] = part.split(":")
    if (id && q && Number(q) > 0) out[id] = Math.min(20, Math.floor(Number(q)))
  }
  return out
}
