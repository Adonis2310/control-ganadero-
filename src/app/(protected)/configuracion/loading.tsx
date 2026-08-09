import { Skeleton } from "@/components/ui/skeleton";

export default function ConfiguracionLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Skeleton className="h-9 w-full max-w-xl" />
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}
