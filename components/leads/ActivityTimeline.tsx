import { Phone, Mail, Calendar, FileText } from "lucide-react"
import type { Activity } from "@/types"

const ACTIVITY_CONFIG: Record<Activity["type"], { icon: React.ElementType; label: string; color: string }> = {
  call:    { icon: Phone,    label: "Ligação",  color: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400" },
  email:   { icon: Mail,    label: "E-mail",   color: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400" },
  meeting: { icon: Calendar, label: "Reunião",  color: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400" },
  note:    { icon: FileText, label: "Nota",     color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  })
}

type Props = { activities: Activity[] }

export default function ActivityTimeline({ activities }: Props) {
  if (activities.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Nenhuma atividade registrada ainda.
      </p>
    )
  }

  const sorted = [...activities].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return (
    <div className="relative space-y-0">
      {sorted.map((activity, i) => {
        const cfg = ACTIVITY_CONFIG[activity.type]
        const Icon = cfg.icon
        const isLast = i === sorted.length - 1

        return (
          <div key={activity.id} className="flex gap-4">
            {/* linha + ícone */}
            <div className="flex flex-col items-center">
              <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${cfg.color}`}>
                <Icon className="size-3.5" />
              </div>
              {!isLast && <div className="w-px flex-1 bg-border my-1" />}
            </div>

            {/* conteúdo */}
            <div className={`pb-6 min-w-0 flex-1 ${isLast ? "pb-0" : ""}`}>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {cfg.label}
                </span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{formatDate(activity.created_at)}</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{activity.description}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
