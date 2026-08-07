import type { Metadata } from "next";
import { Settings } from "lucide-react";

import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Configuración | Control Ganadero" };

export default function ConfiguracionPage() {
  return <ComingSoon title="Configuración" icon={Settings} />;
}
