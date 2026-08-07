import { BarChart3 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface ChartPlaceholderProps {
  title: string;
  description: string;
  className?: string;
}

export function ChartPlaceholder({ title, description, className }: ChartPlaceholderProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 text-muted-foreground">
          <BarChart3 className="size-8" />
          <p className="text-sm">Los datos se conectarán en una fase posterior</p>
        </div>
      </CardContent>
    </Card>
  );
}
