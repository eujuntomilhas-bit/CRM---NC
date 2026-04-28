export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      workspaces: {
        Row: {
          id: string
          name: string
          slug: string
          plan: 'free' | 'pro'
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          plan?: 'free' | 'pro'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          plan?: 'free' | 'pro'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
        }
      }
      workspace_members: {
        Row: {
          id: string
          workspace_id: string
          user_id: string
          role: 'admin' | 'member'
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id: string
          role?: 'admin' | 'member'
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string
          role?: 'admin' | 'member'
          created_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          workspace_id: string
          name: string
          email: string | null
          phone: string | null
          company: string | null
          role: string | null
          status: 'novo' | 'contato' | 'proposta' | 'negociacao' | 'ganho' | 'perdido'
          assignee_id: string | null
          estimated_value: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          name: string
          email?: string | null
          phone?: string | null
          company?: string | null
          role?: string | null
          status?: 'novo' | 'contato' | 'proposta' | 'negociacao' | 'ganho' | 'perdido'
          assignee_id?: string | null
          estimated_value?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          company?: string | null
          role?: string | null
          status?: 'novo' | 'contato' | 'proposta' | 'negociacao' | 'ganho' | 'perdido'
          assignee_id?: string | null
          estimated_value?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      deals: {
        Row: {
          id: string
          workspace_id: string
          lead_id: string | null
          title: string
          value: number
          stage: 'novo' | 'contato' | 'proposta' | 'negociacao' | 'ganho' | 'perdido'
          assignee_id: string | null
          due_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          lead_id?: string | null
          title: string
          value?: number
          stage?: 'novo' | 'contato' | 'proposta' | 'negociacao' | 'ganho' | 'perdido'
          assignee_id?: string | null
          due_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          lead_id?: string | null
          title?: string
          value?: number
          stage?: 'novo' | 'contato' | 'proposta' | 'negociacao' | 'ganho' | 'perdido'
          assignee_id?: string | null
          due_date?: string | null
          created_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          workspace_id: string
          lead_id: string
          type: 'call' | 'email' | 'meeting' | 'note'
          description: string
          author_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          lead_id: string
          type: 'call' | 'email' | 'meeting' | 'note'
          description: string
          author_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          lead_id?: string
          type?: 'call' | 'email' | 'meeting' | 'note'
          description?: string
          author_id?: string | null
          created_at?: string
        }
      }
      invites: {
        Row: {
          id: string
          workspace_id: string
          email: string
          token: string
          role: 'admin' | 'member'
          accepted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          email: string
          token?: string
          role?: 'admin' | 'member'
          accepted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          email?: string
          token?: string
          role?: 'admin' | 'member'
          accepted_at?: string | null
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      is_workspace_member: {
        Args: { ws_id: string }
        Returns: boolean
      }
      is_workspace_admin: {
        Args: { ws_id: string }
        Returns: boolean
      }
    }
    Enums: Record<string, never>
  }
}

// Convenience row types
export type WorkspaceRow         = Database['public']['Tables']['workspaces']['Row']
export type WorkspaceMemberRow   = Database['public']['Tables']['workspace_members']['Row']
export type LeadRow              = Database['public']['Tables']['leads']['Row']
export type DealRow              = Database['public']['Tables']['deals']['Row']
export type ActivityRow          = Database['public']['Tables']['activities']['Row']
export type InviteRow            = Database['public']['Tables']['invites']['Row']
