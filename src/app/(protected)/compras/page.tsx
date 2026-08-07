import type { Metadata } from "next";
import { ShoppingCart } from "lucide-react";

import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Compras | Control Ganadero" };

export default function ComprasPage() {
  return <ComingSoon title="Compras" icon={ShoppingCart} />;
}
