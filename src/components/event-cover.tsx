import { cn } from "@/lib/utils"

/** Generated placeholder artwork until cover image uploads are wired to storage. */
export function EventCover({
  hue,
  className,
  children,
  src,
}: {
  hue: number
  className?: string
  children?: React.ReactNode
  src?: string
}) {
  return (
    <div
      className={cn("relative overflow-hidden bg-muted", className)}
      style={
        src
          ? undefined
          : {
              backgroundImage: `radial-gradient(120% 90% at 15% 10%, oklch(0.82 0.12 ${hue}) 0%, transparent 55%),
                radial-gradient(90% 80% at 90% 100%, oklch(0.6 0.2 ${(hue + 40) % 360}) 0%, transparent 60%),
                linear-gradient(135deg, oklch(0.55 0.17 ${hue}), oklch(0.32 0.1 ${(hue + 20) % 360}))`,
            }
      }
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.18] mix-blend-overlay"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      )}
      {children}
    </div>
  )
}
