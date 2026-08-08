import { Scale } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PesoEmptyState({ onRegistrar }: { onRegistrar: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Scale className="size-5 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="font-medium">Este animal todavía no tiene registros de peso.</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Registra el primer pesaje para empezar a llevar su evolución.
        </p>
      </div>
      <Button onClick={onRegistrar}>+ Registrar primer peso</Button>
    </div>
  );
}
