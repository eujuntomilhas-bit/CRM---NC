export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Bem-vindo de volta!</h2>
        <p className="text-sm text-muted-foreground">Aqui está o resumo do seu negócio hoje.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {["Total de Leads", "Negócios Abertos", "Valor do Pipeline", "Taxa de Conversão"].map((label) => (
          <div key={label} className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-bold text-foreground">—</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-medium text-muted-foreground">
          Gráfico de funil e negócios próximos serão implementados no M5.
        </p>
      </div>
    </div>
  )
}
