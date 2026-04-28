import { cn } from "@/lib/utils"
import Logo from "./Logo"

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
        <div className="mb-5">
          <Logo size="md" />
        </div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && (
          <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="glass-card rounded-2xl p-8">
        {children}
      </div>
    </div>
  )
}
