"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

type Props = {
  children: React.ReactNode
  className?: string
  delay?: 0 | 1 | 2 | 3
}

const DELAY_CLASS = {
  0: "animate-fade-slide-up",
  1: "animate-fade-slide-up-1",
  2: "animate-fade-slide-up-2",
  3: "animate-fade-slide-up-3",
}

export default function AnimateOnScroll({ children, className, delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        "opacity-0",
        visible && DELAY_CLASS[delay],
        className,
      )}
    >
      {children}
    </div>
  )
}
