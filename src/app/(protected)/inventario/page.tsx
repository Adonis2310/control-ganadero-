import type { Metadata } from "next";
import { Boxes } from "lucide-react";

import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Inventario | Control Ganadero" };

export default function InventarioPage() {
  return <ComingSoon title="Inventario" icon={Boxes} />;
}
