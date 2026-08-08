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
  { title: "Compras", href: "/compras", icon: ShoppingCart, comingSoon: true },
  { title: "Ventas", href: "/ventas", icon: Store, comingSoon: true },
  { title: "Clientes", href: "/clientes", icon: Users, comingSoon: true },
  { title: "Proveedores", href: "/proveedores", icon: Truck, comingSoon: true },
  { title: "Calendario", href: "/calendario", icon: Calendar, comingSoon: true },
  { title: "Reportes", href: "/reportes", icon: BarChart3, comingSoon: true },
  { title: "Configuración", href: "/configuracion", icon: Settings, comingSoon: true },
];
