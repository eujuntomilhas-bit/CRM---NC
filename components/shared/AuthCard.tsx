import { cn } from "@/lib/utils"

type Props = {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export default function AuthCard({ title, description, children, className }: Props) {
  return (
    <div className={cn("w-full max-w-md", className)}>
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary">
          <span className="text-sm font-bold text-primary-foreground">C</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && (
          <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        {children}
      </div>
    </div>
  )
}
