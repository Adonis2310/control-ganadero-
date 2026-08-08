import { Skeleton } from "@/components/ui/skeleton";

export default function GastosLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-9 w-36" />
      </div>
      <Skeleton className="h-10 w-full max-w-2xl" />
      <div className="overflow-hidden rounded-xl border">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-14 rounded-none border-b last:border-0" />
        ))}
      </div>
    </div>
  );
}
