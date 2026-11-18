"use client"

import { useEffect, useState } from "react"
import QRCode from "qrcode"
import { cn } from "@/lib/utils"

export function QrCode({ value, className, dim }: { value: string; className?: string; dim?: boolean }) {
  const [svg, setSvg] = useState<string>("")
  useEffect(() => {
    QRCode.toString(value, { type: "svg", margin: 0, errorCorrectionLevel: "M" }).then(setSvg)
  }, [value])
  return (
    <div
      role="img"
      aria-label="Ticket QR code"
      className={cn("aspect-square [&_svg]:size-full", dim && "opacity-15", className)}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
