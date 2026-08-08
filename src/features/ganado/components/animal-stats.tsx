import { Beef, CircleCheck, Mars, Venus } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { AnimalStats } from "@/features/ganado/types";

export function AnimalStatsCards({ stats }: { stats: AnimalStats }) {
  const items = [
    { label: "Total de animales", value: stats.total, icon: Beef },
    { label: "Hembras", value: stats.hembras, icon: Venus },
    { label: "Machos", value: stats.machos, icon: Mars },
    { label: "Activos", value: stats.activos, icon: CircleCheck },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="gap-3">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
            <span className="text-sm font-medium text-muted-foreground">
              {item.label}
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
              <item.icon className="size-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tracking-tight">
              {item.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
