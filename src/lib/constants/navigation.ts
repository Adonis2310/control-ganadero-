import type { LucideIcon } from "lucide-react";
import {
  Beef,
  Boxes,
  Calendar,
  LayoutDashboard,
  Settings,
  ShoppingCart,
  Store,
  Truck,
  Users,
  BarChart3,
  Wallet,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  comingSoon?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Ganado", href: "/ganado", icon: Beef },
  { title: "Inventario", href: "/inventario", icon: Boxes },
  { title: "Compras", href: "/compras", icon: ShoppingCart },
  { title: "Ventas", href: "/ventas", icon: Store },
  { title: "Finanzas", href: "/finanzas", icon: Wallet },
  { title: "Clientes", href: "/clientes", icon: Users },
  { title: "Proveedores", href: "/proveedores", icon: Truck },
  { title: "Calendario", href: "/calendario", icon: Calendar, comingSoon: true },
  { title: "Reportes", href: "/reportes", icon: BarChart3, comingSoon: true },
  { title: "Configuración", href: "/configuracion", icon: Settings, comingSoon: true },
];
