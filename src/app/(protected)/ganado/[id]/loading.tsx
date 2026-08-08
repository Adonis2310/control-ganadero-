import { Skeleton } from "@/components/ui/skeleton";

export default function AnimalDetailLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Skeleton className="size-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-9 w-80" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}
