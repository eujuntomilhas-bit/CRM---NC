import { cn } from "@/lib/utils"

type Props = {
  size?: "sm" | "md" | "lg"
  className?: string
}

const SIZE = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-4xl",
}

export default function Logo({ size = "md", className }: Props) {
  return (
    <span
      className={cn(
        "relative inline-block font-heading font-extrabold leading-none select-none",
        SIZE[size],
        className,
      )}
    >
      <span className="text-foreground">CRM</span>
      <span style={{ color: "#CAFF33" }}>-NC</span>
      {/* animated underline */}
      <span
        className="animate-flow-pulse absolute bottom-[-3px] left-0 h-[2px] w-full rounded-full"
        style={{
          background: "linear-gradient(90deg, transparent, #CAFF33, transparent)",
        }}
      />
    </span>
  )
}
