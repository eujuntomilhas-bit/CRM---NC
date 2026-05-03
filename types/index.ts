export type LeadStatus = 'novo' | 'contato' | 'proposta' | 'negociacao' | 'ganho' | 'perdido'
export type DealStage = 'novo' | 'contato' | 'proposta' | 'negociacao' | 'ganho' | 'perdido'
export type ActivityType = 'call' | 'email' | 'meeting' | 'note'
export type WorkspacePlan = 'free' | 'pro' | 'payment_failed'
export type MemberRole = 'admin' | 'member'

export type Workspace = { id: string; name: string; slug: string; plan: WorkspacePlan }
export type Lead = {
  id: string; workspace_id: string; name: string; email: string
  phone: string; company: string; role: string; status: LeadStatus
  assignee_id: string; estimated_value: number; notes: string; created_at: string
}
export type Deal = {
  id: string; workspace_id: string; lead_id: string; title: string
  value: number; stage: DealStage; assignee_id: string; due_date: string; created_at: string
}
export type Activity = {
  id: string; workspace_id: string; lead_id: string; type: ActivityType
  description: string; author_id: string; created_at: string
}
