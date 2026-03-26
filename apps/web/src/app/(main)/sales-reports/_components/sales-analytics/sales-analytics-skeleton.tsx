import { Skeleton } from "@/components/ui/skeleton";

export function SalesAnalyticsSkeleton() {
  return (
    <div className="bg-card mb-8 rounded-xl border p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <Skeleton className="mb-2 h-3 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="h-9 w-25" />
      </div>
      <Skeleton className="h-25 w-full" />
      <div className="mt-6 grid grid-cols-2 gap-4 border-t pt-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="mb-1 h-3 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
