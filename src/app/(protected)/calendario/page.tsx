import type { Metadata } from "next";
import { Calendar } from "lucide-react";

import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Calendario | Control Ganadero" };

export default function CalendarioPage() {
  return <ComingSoon title="Calendario" icon={Calendar} />;
}
