# Stub — ticketing for university clubs and societies

Frontend MVP for a ticketing platform that charges one small booking fee **per order**, not per ticket.
Built from the build spec; this repo is the frontend only. Every page runs on mock data, and nothing is persisted.

> "Stub" is a placeholder brand. Rename it in `src/lib/config.ts`.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Demo paths

| Flow | URL |
| --- | --- |
| Landing page with fee comparison | `/` |
| Fee calculator | `/pricing` |
| Society page | `/s/harbour-film` |
| Event page and ticket picker (member ID `z5312344`, promo `FINALS20`) | `/e/harbour-film/end-of-semester-double-feature` |
| A buyer's tickets with QR codes | `/t/demo` |
| Organiser dashboard | `/dashboard` → Harbour Film Society |
| Orders, attendees, refunds, CSV export | `/dashboard/harbour-film/events/end-of-semester-double-feature/orders` |
| Event editor with live all-in price | `/dashboard/harbour-film/events/new` |
| Society without Stripe set up | `/dashboard/harbour-robotics` |
| Door scanner (phone; the flask menu simulates scans) | `/door/demo-door` |
| Platform admin, fee settings, disputes, ledger | `/admin` |

Checkout works end to end: it saves the order to `sessionStorage` and redirects to its ticket page.
Scanning a QR from `/t/demo` with `/door/demo-door` on a phone checks it in.

## Stack

Next.js 16 (App Router, TypeScript strict), Tailwind CSS 4, shadcn/ui on Base UI, `qrcode` to render and
`@zxing/browser` to scan.

## Where things live

- `src/lib/fees.ts` — the booking fee formula (one pure function, integer cents)
- `src/lib/cart.ts` — availability, promo validation, order totals
- `src/lib/mock-data.ts` — deterministic mock societies, events, orders, tickets, ledger
- `src/lib/clock.ts` — fixed demo "now" (18 Nov 2026) so sales windows and deadlines stay stable
- `src/app/(site)` — public and buyer pages
- `src/app/dashboard` — organiser dashboard
- `src/app/door` — door-staff scanner
- `src/app/admin` — platform admin

## Not wired yet

Auth (magic links), database, Stripe Connect and Checkout, webhooks, email, file storage and background jobs are
all mocked in the UI. Actions show a toast and update local state only. Comparison numbers on the landing page use
an illustrative per-ticket model; replace them with sourced competitor pricing before launch.
