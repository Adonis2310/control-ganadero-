import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { InventoryStats } from "@/features/inventario/types";

export function InventoryDashboardAlerts({ stats }: { stats: InventoryStats }) {
  const items = [
    { label: "Productos con stock bajo", value: stats.stockBajo },
    { label: "Productos agotados", value: stats.agotados },
  ];
  const totalAlertas = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <div>
          <CardTitle>Inventario</CardTitle>
          <CardDescription>Existencias de productos e insumos</CardDescription>
        </div>
        <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/inventario" />}>
          Ver inventario
        </Button>
      </CardHeader>
      <CardContent>
        {totalAlertas === 0 ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-500" />
            Todos los productos tienen stock suficiente.
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
      </CardContent>
    </Card>
  );
}
