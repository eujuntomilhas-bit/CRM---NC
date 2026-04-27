import type { ReactNode } from "react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* orbs decorativos */}
      <div
        className="design-orb animate-orb-float"
        style={{
          width: 420, height: 420,
          background: "radial-gradient(circle, rgba(202,255,51,0.14), transparent 70%)",
          top: "-8%", left: "-5%",
        }}
      />
      <div
        className="design-orb animate-orb-float"
        style={{
          width: 320, height: 320,
          background: "radial-gradient(circle, rgba(91,127,255,0.12), transparent 70%)",
          bottom: "-8%", right: "-5%",
          animationDelay: "-4s",
        }}
      />
      <div className="relative z-10 animate-page-enter">
        {children}
      </div>
    </div>
  )
}
