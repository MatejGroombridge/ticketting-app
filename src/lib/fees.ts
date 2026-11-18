/**
 * Booking fee formula. All amounts are integer cents (AUD).
 *
 * The fee F is charged once per order and must cover:
 *   - Stripe processing on the whole charge:   p_s * (S + F) + f_s
 *   - Connect payout volume on the transfer:    p_c * S
 *   - Account and payout fees, spread per ticket: a * n
 *   - Platform margin:                          m_o + m_t * n
 *
 * Solving F = p_s(S + F) + f_s + p_c·S + a·n + m_o + m_t·n for F gives:
 *   F = (S(p_s + p_c) + f_s + n(a + m_t) + m_o) / (1 − p_s), rounded up to the cent.
 *
 * Checks from the spec: one $20 ticket with zero margins → 72c; default margins → 97c.
 */

export type FeeSettings = {
  /** Stripe domestic card rate */
  ps: number
  /** Stripe fixed fee per charge, cents */
  fs: number
  /** Connect payout volume fee */
  pc: number
  /** Account and payout fees spread per ticket, cents */
  a: number
  /** Platform margin per order, cents */
  mo: number
  /** Platform margin per paid ticket, cents */
  mt: number
}

export const DEFAULT_FEE_SETTINGS: FeeSettings = {
  ps: 0.0165,
  fs: 30,
  pc: 0.0025,
  a: 2,
  mo: 0,
  mt: 25,
}

export type FeeBreakdown = {
  /** Ticket subtotal after discounts */
  subtotal: number
  bookingFee: number
  total: number
  /** Estimated Stripe processing on the full charge (domestic card) */
  stripeProcessing: number
  connectFee: number
  accountFees: number
  platformMargin: number
}

export function bookingFee(
  subtotalCents: number,
  paidTickets: number,
  s: FeeSettings = DEFAULT_FEE_SETTINGS
): number {
  if (subtotalCents <= 0 || paidTickets <= 0) return 0
  const numerator =
    subtotalCents * (s.ps + s.pc) + s.fs + paidTickets * (s.a + s.mt) + s.mo
  // Subtract a tiny epsilon so float noise never rounds an exact cent up.
  return Math.ceil(numerator / (1 - s.ps) - 1e-9)
}

export function feeBreakdown(
  subtotalCents: number,
  paidTickets: number,
  s: FeeSettings = DEFAULT_FEE_SETTINGS
): FeeBreakdown {
  const fee = bookingFee(subtotalCents, paidTickets, s)
  const total = subtotalCents + fee
  if (fee === 0) {
    return {
      subtotal: subtotalCents,
      bookingFee: 0,
      total,
      stripeProcessing: 0,
      connectFee: 0,
      accountFees: 0,
      platformMargin: 0,
    }
  }
  const stripeProcessing = Math.round(total * s.ps + s.fs)
  const connectFee = Math.round(subtotalCents * s.pc)
  const accountFees = paidTickets * s.a
  return {
    subtotal: subtotalCents,
    bookingFee: fee,
    total,
    stripeProcessing,
    connectFee,
    accountFees,
    platformMargin: fee - stripeProcessing - connectFee - accountFees,
  }
}

/**
 * An illustrative per-ticket fee model for comparison on the marketing pages.
 * TODO: replace with sourced, dated competitor pricing before launch.
 */
export function illustrativePerTicketFee(unitPriceCents: number, qty: number) {
  return qty * Math.round(99 + unitPriceCents * 0.025)
}
