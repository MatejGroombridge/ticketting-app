import { cn } from "@/lib/utils"
import type { EventStatus, OrderStatus, TicketStatus } from "@/lib/types"

type Tone = "neutral" | "brand" | "success" | "warning" | "danger"

const TONES: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground",
  brand: "bg-brand-soft text-brand",
  success: "bg-success/12 text-success",
  warning: "bg-warning/18 text-[oklch(0.5_0.13_60)] dark:text-warning",
  danger: "bg-destructive/10 text-destructive",
}

export function Pill({
  tone = "neutral",
  children,
  className,
  dot = true,
}: {
  tone?: Tone
  children: React.ReactNode
  className?: string
  dot?: boolean
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5.5 items-center gap-1.5 rounded-full px-2 text-xs font-medium whitespace-nowrap",
        TONES[tone],
        className
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current opacity-80" />}
      {children}
    </span>
  )
}

const EVENT: Record<EventStatus, [Tone, string]> = {
  draft: ["neutral", "Draft"],
  published: ["success", "On sale"],
  cancelled: ["danger", "Cancelled"],
  ended: ["neutral", "Ended"],
}
const ORDER: Record<OrderStatus, [Tone, string]> = {
  pending: ["warning", "Pending"],
  paid: ["success", "Paid"],
  partially_refunded: ["warning", "Part refunded"],
  refunded: ["neutral", "Refunded"],
  expired: ["neutral", "Expired"],
  disputed: ["danger", "Disputed"],
}
const TICKET: Record<TicketStatus, [Tone, string]> = {
  valid: ["success", "Valid"],
  checked_in: ["brand", "Checked in"],
  refunded: ["neutral", "Refunded"],
  void: ["danger", "Void"],
}

export const EventStatusBadge = ({ status }: { status: EventStatus }) => (
  <Pill tone={EVENT[status][0]}>{EVENT[status][1]}</Pill>
)
export const OrderStatusBadge = ({ status }: { status: OrderStatus }) => (
  <Pill tone={ORDER[status][0]}>{ORDER[status][1]}</Pill>
)
export const TicketStatusBadge = ({ status }: { status: TicketStatus }) => (
  <Pill tone={TICKET[status][0]}>{TICKET[status][1]}</Pill>
)
