"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

export type MetricCardProps = {
  icon: React.ReactNode
  label: string
  value: number
  /** "currency" → R$, "percent" → %, "number" → plain integer */
  format: "currency" | "percent" | "number"
  delta?: number
  deltaLabel?: string
}

export default function MetricCard({ icon, label, value, format, delta, deltaLabel }: MetricCardProps) {
  const [formatted, setFormatted] = useState<string | null>(null)

  useEffect(() => {
    if (format === "currency") {
      setFormatted(
        new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
          maximumFractionDigits: 0,
        }).format(value)
      )
    } else if (format === "percent") {
      setFormatted(`${value}%`)
    } else {
      setFormatted(String(value))
    }
  }, [value, format])

  const isPositive = delta !== undefined && delta > 0
  const isNegative = delta !== undefined && delta < 0

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground/60">
          {label}
        </p>
        <div className="rounded-lg bg-white/5 p-2 text-muted-foreground">
          {icon}
        </div>
      </div>

      {/* Value */}
      <p className="font-mono text-2xl font-bold tabular-nums text-foreground">
        {formatted ?? "—"}
      </p>

      {/* Delta */}
      {delta !== undefined && (
        <div className="flex items-center gap-1.5">
          {isPositive && <TrendingUp className="size-3.5 shrink-0 text-emerald-400" />}
          {isNegative && <TrendingDown className="size-3.5 shrink-0 text-rose-400" />}
          <span
            className={cn(
              "text-[11px] font-medium tabular-nums",
              isPositive && "text-emerald-400",
              isNegative && "text-rose-400",
              !isPositive && !isNegative && "text-muted-foreground/60",
            )}
          >
            {isPositive ? "+" : ""}{delta}%
          </span>
          {deltaLabel && (
            <span className="text-[11px] text-muted-foreground/40">{deltaLabel}</span>
          )}
        </div>
      )}
    </div>
  )
}
