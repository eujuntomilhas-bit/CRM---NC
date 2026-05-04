import { Skeleton } from "@/components/ui/skeleton"

export default function PipelineSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-5">
        <div className="space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-8 w-32 rounded-md" />
      </div>

      {/* Stat cards */}
      <div className="mb-5 flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
            <Skeleton className="size-4 rounded" />
            <div className="space-y-1.5">
              <Skeleton className="h-2.5 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-2.5 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Kanban columns */}
      <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto pb-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex w-[264px] shrink-0 flex-col gap-2.5">
            <div className="space-y-2 px-0.5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-6 rounded" />
              </div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-[2px] w-full" />
            </div>
            <div className="flex flex-1 flex-col gap-2 rounded-xl border border-border p-2">
              {Array.from({ length: i === 1 ? 3 : 2 }).map((_, j) => (
                <div key={j} className="rounded-lg border border-border bg-card p-3 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
