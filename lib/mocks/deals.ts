import type { Deal } from "@/types"

export const mockDeals: Deal[] = [
  // Novo Lead (2)
  {
    id: "d01", workspace_id: "w1", lead_id: "l05", title: "InovaGroup — CRM Equipe Marketing",
    value: 4800, stage: "novo", assignee_id: "u2", due_date: "2025-04-30",
  },
  {
    id: "d02", workspace_id: "w1", lead_id: "l09", title: "AutoPeças Sul — Gestão Comercial",
    value: 3600, stage: "novo", assignee_id: "u1", due_date: "2025-05-10",
  },

  // Contato Realizado (2)
  {
    id: "d03", workspace_id: "w1", lead_id: "l04", title: "MercadoLog — Pipeline Operações",
    value: 9600, stage: "contato", assignee_id: "u3", due_date: "2025-04-25",
  },
  {
    id: "d04", workspace_id: "w1", lead_id: "l08", title: "EducaMais — Plano Pro Anual",
    value: 4800, stage: "contato", assignee_id: "u2", due_date: "2025-05-05",
  },

  // Proposta Enviada (2)
  {
    id: "d05", workspace_id: "w1", lead_id: "l01", title: "Construtora Mendes — Pro 10 Usuários",
    value: 12000, stage: "proposta", assignee_id: "u1", due_date: "2025-04-22",
  },
  {
    id: "d06", workspace_id: "w1", lead_id: "l07", title: "FinVest Capital — Licença Corporativa",
    value: 7200, stage: "proposta", assignee_id: "u3", due_date: "2025-04-28",
  },

  // Negociação (2)
  {
    id: "d07", workspace_id: "w1", lead_id: "l02", title: "TechBR Soluções — Contrato Anual",
    value: 28000, stage: "negociacao", assignee_id: "u2", due_date: "2025-04-20",
  },
  {
    id: "d08", workspace_id: "w1", lead_id: "l10", title: "Saúde 360 — Integração Hospitalar",
    value: 36000, stage: "negociacao", assignee_id: "u3", due_date: "2025-04-18",
  },

  // Fechado Ganho (2)
  {
    id: "d09", workspace_id: "w1", lead_id: "l03", title: "AvaSoft — Pro Anual",
    value: 9600, stage: "ganho", assignee_id: "u1", due_date: "2025-02-15",
  },
  {
    id: "d10", workspace_id: "w1", lead_id: "l11", title: "ConstraPro — 15 Usuários Pro",
    value: 18000, stage: "ganho", assignee_id: "u2", due_date: "2025-02-10",
  },

  // Fechado Perdido (2)
  {
    id: "d11", workspace_id: "w1", lead_id: "l06", title: "Grupo Verde Agro — Pro",
    value: 15000, stage: "perdido", assignee_id: "u1", due_date: "2025-01-20",
  },
  {
    id: "d12", workspace_id: "w1", lead_id: "l12", title: "Lojas Moda Brasil — Plano Pro",
    value: 8400, stage: "perdido", assignee_id: "u1", due_date: "2025-01-05",
  },
]
