import { Sprout } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Sprout className="size-4" />
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-sm font-semibold">Control Ganadero</span>
        <span className="text-xs text-muted-foreground">Gestión de finca</span>
      </div>
    </div>
  );
}
