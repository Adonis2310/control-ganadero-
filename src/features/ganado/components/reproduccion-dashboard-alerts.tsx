import Link from "next/link";
import { AlertTriangle, CheckCircle2, HeartHandshake } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReproduccionGeneralStats } from "@/features/ganado/types";

export function ReproduccionDashboardAlerts({ stats }: { stats: ReproduccionGeneralStats }) {
  const items = [
    { label: "Partos próximos", value: stats.partosProximos },
    { label: "Hembras en celo", value: stats.hembrasEnCelo },
  ];
  const totalAlertas = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <div>
          <CardTitle>Reproducción</CardTitle>
          <CardDescription>Estado reproductivo general de la finca</CardDescription>
        </div>
        <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/reproduccion" />}>
          Ver reproducción
        </Button>
      </CardHeader>
      <CardContent>
        {totalAlertas === 0 ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-500" />
            No hay partos próximos ni hembras en celo por ahora.
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {items
              .filter((item) => item.value > 0)
              .map((item) => (
                <li key={item.label} className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <AlertTriangle className="size-3.5 text-amber-600 dark:text-amber-500" />
                    {item.label}
                  </span>
                  <span className="font-medium">{item.value}</span>
                </li>
              ))}
          </ul>
        )}
        {totalAlertas === 0 && (
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <HeartHandshake className="size-3.5" />
            {stats.hembrasGestantes} hembra(s) gestante(s) en seguimiento.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
