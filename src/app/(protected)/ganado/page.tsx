import type { Metadata } from "next";
import { Beef } from "lucide-react";

import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Ganado | Control Ganadero" };

export default function GanadoPage() {
  return <ComingSoon title="Ganado" icon={Beef} />;
}
