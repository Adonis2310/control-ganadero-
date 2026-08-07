import { TrendingDown, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { StatCardData } from "@/features/dashboard/types";

export function StatCard({ label, value, change, trend, icon: Icon }: StatCardData) {
  return (
    <Card className="gap-3">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
        <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
          <Icon className="size-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        {trend !== "neutral" ? (
          <p
            className={cn(
              "mt-1 flex items-center gap-1 text-xs font-medium",
              trend === "up" ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500",
            )}
          >
            {trend === "up" ? (
              <TrendingUp className="size-3.5" />
            ) : (
              <TrendingDown className="size-3.5" />
            )}
            {change}
          </p>
        ) : (
          <p className="mt-1 text-xs font-medium text-muted-foreground">
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
