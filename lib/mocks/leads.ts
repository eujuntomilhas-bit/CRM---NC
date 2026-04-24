import type { Lead, Activity } from "@/types"

export const MOCK_USERS = [
  { id: "u1", name: "Ana Souza" },
  { id: "u2", name: "Carlos Lima" },
  { id: "u3", name: "Mariana Costa" },
]

export const mockLeads: Lead[] = [
  {
    id: "l01", workspace_id: "w1", name: "Rafael Mendes", email: "rafael.mendes@construtora.com.br",
    phone: "(11) 99876-5432", company: "Construtora Mendes", role: "Diretor Comercial",
    status: "proposta", assignee_id: "u1", estimated_value: 12000,
    notes: "Interessado no plano Pro para equipe de 10 pessoas.", created_at: "2025-03-01T10:00:00Z",
  },
  {
    id: "l02", workspace_id: "w1", name: "Juliana Ferreira", email: "ju.ferreira@techbr.io",
    phone: "(21) 98765-4321", company: "TechBR Soluções", role: "CEO",
    status: "negociacao", assignee_id: "u2", estimated_value: 28000,
    notes: "", created_at: "2025-03-05T14:30:00Z",
  },
  {
    id: "l03", workspace_id: "w1", name: "Bruno Alves", email: "bruno@avasoft.com.br",
    phone: "(31) 97654-3210", company: "AvaSoft", role: "Gerente de TI",
    status: "ganho", assignee_id: "u1", estimated_value: 9600,
    notes: "Contrato anual assinado em fevereiro.", created_at: "2025-02-15T09:00:00Z",
  },
  {
    id: "l04", workspace_id: "w1", name: "Fernanda Rocha", email: "fernanda@mercadolog.com.br",
    phone: "(41) 96543-2109", company: "MercadoLog", role: "Diretora de Operações",
    status: "contato", assignee_id: "u3", estimated_value: 0,
    notes: "", created_at: "2025-03-10T11:00:00Z",
  },
  {
    id: "l05", workspace_id: "w1", name: "Diego Nascimento", email: "diego.n@inovagroup.com.br",
    phone: "(51) 95432-1098", company: "InovaGroup", role: "Head de Marketing",
    status: "novo", assignee_id: "u2", estimated_value: 0,
    notes: "Lead veio via indicação do Bruno Alves.", created_at: "2025-03-18T16:00:00Z",
  },
  {
    id: "l06", workspace_id: "w1", name: "Patricia Lima", email: "patricia@grupoverde.com.br",
    phone: "(61) 94321-0987", company: "Grupo Verde Agro", role: "Sócia-Fundadora",
    status: "perdido", assignee_id: "u1", estimated_value: 15000,
    notes: "Escolheu concorrente por preço.", created_at: "2025-01-20T08:00:00Z",
  },
  {
    id: "l07", workspace_id: "w1", name: "Thiago Cardoso", email: "thiago.cardoso@finvest.com.br",
    phone: "(71) 93210-9876", company: "FinVest Capital", role: "Analista Sênior",
    status: "proposta", assignee_id: "u3", estimated_value: 7200,
    notes: "", created_at: "2025-03-12T13:00:00Z",
  },
  {
    id: "l08", workspace_id: "w1", name: "Camila Vieira", email: "camila@educamais.com.br",
    phone: "(81) 92109-8765", company: "EducaMais", role: "Coordenadora Pedagógica",
    status: "contato", assignee_id: "u2", estimated_value: 4800,
    notes: "", created_at: "2025-03-08T10:30:00Z",
  },
  {
    id: "l09", workspace_id: "w1", name: "Leandro Martins", email: "leandro@autopecas.com.br",
    phone: "(85) 91098-7654", company: "AutoPeças Sul", role: "Gerente Comercial",
    status: "novo", assignee_id: "u1", estimated_value: 0,
    notes: "", created_at: "2025-03-20T09:15:00Z",
  },
  {
    id: "l10", workspace_id: "w1", name: "Vanessa Gomes", email: "vgomes@saude360.com.br",
    phone: "(92) 90987-6543", company: "Saúde 360", role: "Diretora Médica",
    status: "negociacao", assignee_id: "u3", estimated_value: 36000,
    notes: "Precisa de integração com sistema hospitalar.", created_at: "2025-03-02T15:00:00Z",
  },
  {
    id: "l11", workspace_id: "w1", name: "Rodrigo Pires", email: "rodrigo@constrapro.com.br",
    phone: "(11) 98888-7777", company: "ConstraPro", role: "Engenheiro de Projetos",
    status: "ganho", assignee_id: "u2", estimated_value: 18000,
    notes: "", created_at: "2025-02-10T12:00:00Z",
  },
  {
    id: "l12", workspace_id: "w1", name: "Isabela Santos", email: "isa.santos@lojasmoda.com.br",
    phone: "(21) 97777-6666", company: "Lojas Moda Brasil", role: "Compradora",
    status: "perdido", assignee_id: "u1", estimated_value: 8400,
    notes: "Orçamento não aprovado pela diretoria.", created_at: "2025-01-05T14:00:00Z",
  },
]

export const mockActivities: Activity[] = [
  {
    id: "a01", workspace_id: "w1", lead_id: "l01", type: "call",
    description: "Ligação inicial para apresentar o produto. Rafael demonstrou interesse na solução de CRM para a equipe comercial.",
    author_id: "u1", created_at: "2025-03-02T10:30:00Z",
  },
  {
    id: "a02", workspace_id: "w1", lead_id: "l01", type: "email",
    description: "Enviado e-mail com proposta comercial e materiais de apresentação do plano Pro.",
    author_id: "u1", created_at: "2025-03-05T14:00:00Z",
  },
  {
    id: "a03", workspace_id: "w1", lead_id: "l01", type: "meeting",
    description: "Reunião por videoconferência com o time. Apresentado demo completo. Próximos passos: aguardar aprovação do CFO.",
    author_id: "u1", created_at: "2025-03-10T16:00:00Z",
  },
  {
    id: "a04", workspace_id: "w1", lead_id: "l02", type: "call",
    description: "Juliana entrou em contato pedindo ajuste nos valores. Negociação em andamento.",
    author_id: "u2", created_at: "2025-03-06T11:00:00Z",
  },
  {
    id: "a05", workspace_id: "w1", lead_id: "l02", type: "note",
    description: "Cliente sinalizou que tem concorrente oferecendo 20% mais barato. Precisamos reforçar diferenciais.",
    author_id: "u2", created_at: "2025-03-08T09:00:00Z",
  },
  {
    id: "a06", workspace_id: "w1", lead_id: "l03", type: "meeting",
    description: "Reunião de onboarding realizada. Contrato assinado. Cliente satisfeito com a integração.",
    author_id: "u1", created_at: "2025-02-20T14:00:00Z",
  },
  {
    id: "a07", workspace_id: "w1", lead_id: "l04", type: "email",
    description: "Primeiro contato por e-mail após indicação. Aguardando retorno para agendar demo.",
    author_id: "u3", created_at: "2025-03-11T10:00:00Z",
  },
  {
    id: "a08", workspace_id: "w1", lead_id: "l07", type: "call",
    description: "Conversa com Thiago sobre necessidades específicas do setor financeiro. Solicitou proposta customizada.",
    author_id: "u3", created_at: "2025-03-13T15:30:00Z",
  },
]
