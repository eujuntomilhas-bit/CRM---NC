export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Configurações</h2>
        <p className="text-sm text-muted-foreground">Gerencie seu workspace e conta</p>
      </div>
      <div className="grid gap-4">
        {["Workspace", "Membros", "Plano"].map((section) => (
          <div key={section} className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-medium text-foreground">{section}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Configurações de {section.toLowerCase()} serão implementadas no M9.
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
