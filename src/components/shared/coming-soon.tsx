import type { LucideIcon } from "lucide-react";
import { Construction } from "lucide-react";

interface ComingSoonProps {
  title: string;
  icon?: LucideIcon;
}

export function ComingSoon({ title, icon: Icon = Construction }: ComingSoonProps) {
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-4 rounded-xl border border-dashed text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <Icon className="size-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Este módulo estará disponible próximamente. Estamos trabajando en
          esta funcionalidad para las siguientes fases del proyecto.
        </p>
      </div>
    </div>
  );
}
