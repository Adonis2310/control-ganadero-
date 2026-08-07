import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";

import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Reportes | Control Ganadero" };

export default function ReportesPage() {
  return <ComingSoon title="Reportes" icon={BarChart3} />;
}
