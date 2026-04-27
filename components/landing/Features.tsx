import { Kanban, Users, BarChart2, Building2, Clock, Zap } from "lucide-react"
import AnimateOnScroll from "@/components/shared/AnimateOnScroll"

const FEATURES = [
  {
    icon: Kanban,
    title: "Pipeline Kanban",
    description: "Arraste negócios entre etapas com drag-and-drop. Visualize o funil completo em tempo real e nunca perca uma oportunidade.",
  },
  {
    icon: Users,
    title: "Gestão de Leads",
    description: "Cadastro completo com empresa, cargo, e-mail e telefone. Filtros avançados, busca instantânea e histórico de contatos.",
  },
  {
    icon: BarChart2,
    title: "Dashboard de Métricas",
    description: "4 KPIs principais, gráfico de funil por etapa e lista de negócios com prazo próximo — tudo atualizado em tempo real.",
  },
  {
    icon: Building2,
    title: "Multi-empresa",
    description: "Crie workspaces separados para cada cliente ou time. Dados totalmente isolados com controle de acesso por papel.",
  },
  {
    icon: Clock,
    title: "Histórico de Atividades",
    description: "Registre ligações, e-mails, reuniões e notas. Timeline cronológica vinculada a cada lead para nunca perder contexto.",
  },
  {
    icon: Zap,
    title: "Plano Gratuito",
    description: "Comece sem cartão de crédito. Até 2 colaboradores e 50 leads no plano Free. Faça upgrade quando seu time crescer.",
  },
]

export default function Features() {
  return (
    <section id="funcionalidades" className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <AnimateOnScroll className="mb-14 text-center">
          <p
            className="font-mono-design mb-3 text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#CAFF33" }}
          >
            Funcionalidades
          </p>
          <h2 className="font-heading text-3xl font-bold text-foreground md:text-4xl">
            Tudo que seu time precisa
            <br />
            para fechar mais negócios
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
            Ferramentas focadas em vendas, sem a complexidade e o custo das soluções corporativas.
          </p>
        </AnimateOnScroll>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <AnimateOnScroll key={f.title} delay={(i % 4) as 0 | 1 | 2 | 3}>
              <div className="glass-card group flex h-full flex-col gap-4 rounded-2xl p-6">
                <div
                  className="flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-300 group-hover:bg-[rgba(202,255,51,0.15)]"
                  style={{ background: "rgba(202,255,51,0.07)" }}
                >
                  <f.icon className="size-5" style={{ color: "#CAFF33" }} />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-foreground">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
