const TZ = "Australia/Sydney"

export function money(cents: number, opts: { free?: boolean } = {}) {
  if (opts.free && cents === 0) return "Free"
  const sign = cents < 0 ? "−" : ""
  return `${sign}$${(Math.abs(cents) / 100).toFixed(2)}`
}

/** Whole-dollar display for big dashboard numbers. */
export function moneyShort(cents: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100)
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: TZ,
  }).format(new Date(iso))
}

export function formatShortDate(iso: string) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    timeZone: TZ,
  }).format(new Date(iso))
}

export function formatTime(iso: string) {
  return new Intl.DateTimeFormat("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: TZ,
  })
    .format(new Date(iso))
    .replace(" ", "")
    .toLowerCase()
}

export function formatDateTime(iso: string) {
  return `${formatDate(iso)}, ${formatTime(iso)}`
}

export function formatTimeRange(startIso: string, endIso: string) {
  return `${formatTime(startIso)} – ${formatTime(endIso)}`
}

export function monthDay(iso: string) {
  const d = new Date(iso)
  return {
    month: new Intl.DateTimeFormat("en-AU", { month: "short", timeZone: TZ })
      .format(d)
      .toUpperCase(),
    day: new Intl.DateTimeFormat("en-AU", { day: "numeric", timeZone: TZ }).format(d),
  }
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("")
}

export function pluralise(n: number, word: string, plural = `${word}s`) {
  return `${n} ${n === 1 ? word : plural}`
}
