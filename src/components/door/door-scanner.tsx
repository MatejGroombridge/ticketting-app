"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Camera, CameraOff, Check, FlaskConical, RotateCcw, ScanLine, Search, TriangleAlert, Wifi, WifiOff, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatTime } from "@/lib/format"
import type { Ticket, TicketEvent } from "@/lib/types"
import { cn } from "@/lib/utils"

export type DoorTicket = Ticket & { buyerEmail: string }

type Result =
  | { kind: "valid"; ticket: DoorTicket }
  | { kind: "used"; ticket: DoorTicket }
  | { kind: "invalid"; title: string; detail: string; ticket?: DoorTicket }

export function DoorScanner({
  event,
  tickets: initial,
  otherEventTokens,
  label,
}: {
  event: TicketEvent
  tickets: DoorTicket[]
  otherEventTokens: string[]
  label: string
}) {
  const [tickets, setTickets] = useState(initial)
  const [mode, setMode] = useState<"scan" | "search">("scan")
  const [result, setResult] = useState<Result | null>(null)
  const [q, setQ] = useState("")
  const [online, setOnline] = useState(true)
  const ticketsRef = useRef(tickets)
  useEffect(() => {
    ticketsRef.current = tickets
  }, [tickets])
  const lastScan = useRef<{ token: string; at: number } | null>(null)

  const typeName = (id: string) => event.ticketTypes.find((t) => t.id === id)?.name ?? "Ticket"
  const live = tickets.filter((t) => t.status === "valid" || t.status === "checked_in")
  const checkedIn = tickets.filter((t) => t.status === "checked_in").length

  useEffect(() => {
    const up = () => setOnline(true)
    const down = () => setOnline(false)
    window.addEventListener("online", up)
    window.addEventListener("offline", down)
    return () => {
      window.removeEventListener("online", up)
      window.removeEventListener("offline", down)
    }
  }, [])

  const checkIn = useCallback((id: string) => {
    const at = new Date().toISOString()
    setTickets((ts) => ts.map((t) => (t.id === id ? { ...t, status: "checked_in", checkedInAt: at } : t)))
  }, [])

  const handleToken = useCallback(
    (raw: string) => {
      const token = raw.trim()
      const now = Date.now()
      // Ignore the same code held in front of the camera for a moment.
      if (lastScan.current && lastScan.current.token === token && now - lastScan.current.at < 3000) return
      lastScan.current = { token, at: now }
      const t = ticketsRef.current.find((x) => x.qrToken === token)
      if ("vibrate" in navigator) navigator.vibrate?.(t?.status === "valid" ? 60 : [80, 60, 80])
      if (!t) {
        setResult(
          otherEventTokens.includes(token)
            ? { kind: "invalid", title: "Wrong event", detail: "This ticket is for a different event." }
            : { kind: "invalid", title: "Not found", detail: "This QR code isn't a ticket we know about." }
        )
        return
      }
      if (t.status === "checked_in") return setResult({ kind: "used", ticket: t })
      if (t.status === "refunded" || t.status === "void")
        return setResult({ kind: "invalid", title: t.status === "refunded" ? "Refunded" : "Void", detail: "This ticket is no longer valid.", ticket: t })
      checkIn(t.id)
      setResult({ kind: "valid", ticket: t })
    },
    [checkIn, otherEventTokens]
  )

  // Auto-dismiss a green result so the line keeps moving; red and amber stay until tapped.
  useEffect(() => {
    if (result?.kind !== "valid") return
    const id = setTimeout(() => setResult(null), 1800)
    return () => clearTimeout(id)
  }, [result])

  const needle = q.trim().toLowerCase()
  const matches = needle
    ? tickets.filter((t) => t.attendeeName.toLowerCase().includes(needle) || t.buyerEmail.includes(needle)).slice(0, 30)
    : []

  const demoValid = tickets.find((t) => t.status === "valid")
  const demoRefunded = tickets.find((t) => t.status === "refunded")

  return (
    <div className="flex min-h-dvh flex-col bg-neutral-950 text-white">
      <header className="flex items-center gap-3 px-4 pt-[max(env(safe-area-inset-top),12px)] pb-3">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{event.title}</div>
          <div className="flex items-center gap-1.5 text-xs text-white/60">
            {online ? <Wifi className="size-3" /> : <WifiOff className="size-3 text-amber-400" />}
            {online ? label : "Offline · retrying"}
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold tabular leading-none">
            {checkedIn}
            <span className="text-white/50"> / {live.length}</span>
          </div>
          <div className="text-[11px] text-white/60">checked in</div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="text-white/70 hover:bg-white/10 hover:text-white" aria-label="Demo scans" />}>
            <FlaskConical />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuGroup>
            <DropdownMenuLabel>Simulate a scan</DropdownMenuLabel>
            {demoValid && <DropdownMenuItem onClick={() => handleToken(demoValid.qrToken)}>Valid ticket</DropdownMenuItem>}
            {checkedIn > 0 && (
              <DropdownMenuItem onClick={() => handleToken(tickets.find((t) => t.status === "checked_in")!.qrToken)}>
                Already checked in
              </DropdownMenuItem>
            )}
            {demoRefunded && <DropdownMenuItem onClick={() => handleToken(demoRefunded.qrToken)}>Refunded ticket</DropdownMenuItem>}
            {otherEventTokens[0] && <DropdownMenuItem onClick={() => handleToken(otherEventTokens[0]!)}>Different event</DropdownMenuItem>}
            <DropdownMenuItem onClick={() => handleToken(`fake-${Date.now()}`)}>Unknown code</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="mx-4 h-1 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${(checkedIn / Math.max(1, live.length)) * 100}%` }} />
      </div>

      <main className="relative flex flex-1 flex-col">
        {mode === "scan" ? (
          <CameraView onCode={handleToken} paused={!!result} />
        ) : (
          <div className="flex-1 overflow-y-auto px-4 pt-4 pb-28">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/50" />
              <Input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name or email"
                className="h-12 border-white/15 bg-white/5 pl-9 text-base text-white placeholder:text-white/40"
              />
            </div>
            <ul className="mt-3 space-y-2">
              {needle && matches.length === 0 && <li className="py-10 text-center text-sm text-white/50">No tickets match &ldquo;{q}&rdquo;</li>}
              {!needle && <li className="py-10 text-center text-sm text-white/50">For guests without their phone. Search by the name or email on the booking.</li>}
              {matches.map((t) => (
                <li key={t.id} className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{t.attendeeName}</div>
                    <div className="truncate text-xs text-white/50">
                      {typeName(t.ticketTypeId)} · {t.buyerEmail}
                    </div>
                  </div>
                  {t.status === "valid" && (
                    <Button
                      className="h-10 bg-emerald-500 px-4 text-white hover:bg-emerald-500/90"
                      onClick={() => {
                        checkIn(t.id)
                        setResult({ kind: "valid", ticket: t })
                      }}
                    >
                      Check in
                    </Button>
                  )}
                  {t.status === "checked_in" && <span className="text-xs text-amber-300">In at {formatTime(t.checkedInAt!)}</span>}
                  {(t.status === "refunded" || t.status === "void") && <span className="text-xs text-red-400 capitalize">{t.status}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        <nav className="absolute inset-x-0 bottom-0 flex justify-center gap-2 bg-gradient-to-t from-neutral-950 via-neutral-950/90 to-transparent px-4 pt-8 pb-[max(env(safe-area-inset-bottom),16px)]">
          <div className="flex rounded-full bg-white/10 p-1">
            {(["scan", "search"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "flex h-11 items-center gap-2 rounded-full px-5 text-sm font-medium capitalize transition-colors",
                  mode === m ? "bg-white text-neutral-950" : "text-white/70"
                )}
              >
                {m === "scan" ? <ScanLine className="size-4" /> : <Search className="size-4" />}
                {m}
              </button>
            ))}
          </div>
        </nav>
      </main>

      {result && <ResultOverlay result={result} typeName={typeName} onDismiss={() => setResult(null)} />}
    </div>
  )
}

function ResultOverlay({ result, typeName, onDismiss }: { result: Result; typeName: (id: string) => string; onDismiss: () => void }) {
  const tone =
    result.kind === "valid" ? "bg-emerald-500" : result.kind === "used" ? "bg-amber-400 text-neutral-950" : "bg-red-500"
  const Icon = result.kind === "valid" ? Check : result.kind === "used" ? RotateCcw : result.title === "Wrong event" ? TriangleAlert : X
  const t = result.ticket
  return (
    <button
      onClick={onDismiss}
      className={cn("fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 p-8 text-center animate-in fade-in zoom-in-95 duration-150", tone)}
      aria-live="assertive"
    >
      <span className="grid size-24 place-items-center rounded-full bg-black/15">
        <Icon className="size-12" strokeWidth={2.5} />
      </span>
      <span className="text-4xl font-bold">
        {result.kind === "valid" ? "Valid" : result.kind === "used" ? "Already in" : result.title}
      </span>
      {t && (
        <span className="text-xl font-medium">
          {t.attendeeName}
          <span className="block text-base font-normal opacity-80">{typeName(t.ticketTypeId)}</span>
        </span>
      )}
      {result.kind === "used" && <span className="text-base">Checked in at {formatTime(result.ticket.checkedInAt!)}</span>}
      {result.kind === "invalid" && <span className="text-base opacity-90">{result.detail}</span>}
      <span className="absolute bottom-[max(env(safe-area-inset-bottom),24px)] text-sm opacity-70">Tap to scan next</span>
    </button>
  )
}

function CameraView({ onCode, paused }: { onCode: (token: string) => void; paused: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [state, setState] = useState<"starting" | "on" | "denied" | "unsupported">("starting")
  const cb = useRef(onCode)
  const pausedRef = useRef(paused)
  useEffect(() => {
    cb.current = onCode
    pausedRef.current = paused
  }, [onCode, paused])

  useEffect(() => {
    let stop: (() => void) | undefined
    let cancelled = false
    if (!navigator.mediaDevices?.getUserMedia) {
      Promise.resolve().then(() => !cancelled && setState("unsupported"))
      return () => {
        cancelled = true
      }
    }
    import("@zxing/browser").then(({ BrowserQRCodeReader }) => {
      if (cancelled || !videoRef.current) return
      const reader = new BrowserQRCodeReader()
      reader
        .decodeFromConstraints({ video: { facingMode: "environment" } }, videoRef.current, (res) => {
          if (res && !pausedRef.current) cb.current(res.getText())
        })
        .then((controls) => {
          if (cancelled) controls.stop()
          else {
            stop = () => controls.stop()
            setState("on")
          }
        })
        .catch(() => !cancelled && setState("denied"))
    })
    return () => {
      cancelled = true
      stop?.()
    }
  }, [])

  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden">
      <video ref={videoRef} className={cn("absolute inset-0 size-full object-cover", state !== "on" && "opacity-0")} muted playsInline />
      {state === "on" && (
        <div className="relative size-64 rounded-3xl shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]">
          {["top-0 left-0 border-t-4 border-l-4 rounded-tl-3xl", "top-0 right-0 border-t-4 border-r-4 rounded-tr-3xl", "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-3xl", "bottom-0 right-0 border-b-4 border-r-4 rounded-br-3xl"].map((c) => (
            <span key={c} className={cn("absolute size-10 border-white", c)} />
          ))}
        </div>
      )}
      {state !== "on" && (
        <div className="max-w-xs px-6 text-center text-white/70">
          {state === "starting" ? <Camera className="mx-auto size-8 animate-pulse" /> : <CameraOff className="mx-auto size-8" />}
          <p className="mt-3 text-sm">
            {state === "starting" && "Starting camera…"}
            {state === "denied" && "Camera access was blocked. Allow camera access in your browser settings, or use Search."}
            {state === "unsupported" && "This browser can't use the camera. Use Search instead."}
          </p>
          <p className="mt-2 text-xs text-white/40">Tip: the flask menu simulates scans for testing.</p>
        </div>
      )}
      {state === "on" && <p className="absolute bottom-28 text-sm text-white/80">Point at a ticket QR code</p>}
    </div>
  )
}
