import { Skeleton } from "@/components/ui/skeleton";

export default function MovimientosLoading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-40" />
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-10 w-full max-w-2xl" />
      <div className="overflow-hidden rounded-xl border">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-12 rounded-none border-b last:border-0" />
        ))}
      </div>
    </div>
  );
}
