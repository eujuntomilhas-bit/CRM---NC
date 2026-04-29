"use client"

import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { cn } from "@/lib/utils"
import type { DealStage } from "@/types"

type FunnelRow = { stage: DealStage; label: string; count: number; value: number }

const STAGE_COLORS: Record<string, string> = {
  novo:       "#94a3b8",
  contato:    "#60a5fa",
  proposta:   "#fbbf24",
  negociacao: "#fb923c",
  ganho:      "#34d399",
}

type TooltipPayload = {
  active?: boolean
  payload?: { payload: FunnelRow }[]
}

function CustomTooltip({ active, payload }: TooltipPayload) {
  const [formatted, setFormatted] = useState<string | null>(null)
  const row = payload?.[0]?.payload

  useEffect(() => {
    if (!row) return
    setFormatted(
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
      }).format(row.value)
    )
  }, [row])

  if (!active || !row) return null

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="text-[11px] font-semibold text-foreground">{row.label}</p>
      <p className="mt-0.5 font-mono text-xs tabular-nums text-muted-foreground">
        {row.count} negócio{row.count !== 1 ? "s" : ""} · {formatted ?? "—"}
      </p>
    </div>
  )
}

type Props = {
  data: FunnelRow[]
  className?: string
}

export default function FunnelChart({ data, className }: Props) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-5", className)}>
      <div className="mb-4">
        <p className="text-sm font-semibold text-foreground">Funil de Vendas</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground/60">Negócios por etapa</p>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 0, left: 8 }}
          barSize={36}
        >
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#ffffff", fontWeight: 500 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={20}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((row) => (
              <Cell
                key={row.stage}
                fill={STAGE_COLORS[row.stage] ?? "#6b7280"}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
