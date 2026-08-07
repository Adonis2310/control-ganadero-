import type { Metadata } from "next";
import { Store } from "lucide-react";

import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Ventas | Control Ganadero" };

export default function VentasPage() {
  return <ComingSoon title="Ventas" icon={Store} />;
}
