import { Skeleton } from "@/components/ui/skeleton";

export default function EditarClienteLoading() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}
