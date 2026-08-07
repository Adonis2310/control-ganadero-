import type { Metadata } from "next";
import { Truck } from "lucide-react";

import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Proveedores | Control Ganadero" };

export default function ProveedoresPage() {
  return <ComingSoon title="Proveedores" icon={Truck} />;
}
