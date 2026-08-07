import type { Metadata } from "next";
import { Users } from "lucide-react";

import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Clientes | Control Ganadero" };

export default function ClientesPage() {
  return <ComingSoon title="Clientes" icon={Users} />;
}
