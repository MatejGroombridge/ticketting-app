"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

export function SimpleSelect<T extends string>({
  value,
  onValueChange,
  items,
  className,
  id,
  placeholder,
}: {
  value: T
  onValueChange: (v: T) => void
  items: { value: T; label: string }[]
  className?: string
  id?: string
  placeholder?: string
}) {
  return (
    <Select
      items={items}
      value={value}
      onValueChange={(v) => v != null && onValueChange(v as T)}
    >
      <SelectTrigger id={id} className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items.map((i) => (
          <SelectItem key={i.value} value={i.value}>
            {i.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
