// Orders created during a demo session live in sessionStorage until the backend exists.
import type { Order, Ticket } from "./types"

const KEY = (token: string) => `stub:order:${token}`

export type DemoOrder = { order: Order; tickets: Ticket[] }

export function saveDemoOrder(d: DemoOrder) {
  try {
    sessionStorage.setItem(KEY(d.order.token), JSON.stringify(d))
  } catch {
    // storage unavailable: the ticket page will show "not found"
  }
}

export function loadDemoOrder(token: string): DemoOrder | null {
  try {
    const raw = sessionStorage.getItem(KEY(token))
    return raw ? (JSON.parse(raw) as DemoOrder) : null
  } catch {
    return null
  }
}

export function randomToken(len = 22) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"
  const bytes = crypto.getRandomValues(new Uint8Array(len))
  return Array.from(bytes, (b) => chars[b % chars.length]).join("")
}
