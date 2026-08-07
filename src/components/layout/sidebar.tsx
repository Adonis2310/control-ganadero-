import { Logo } from "@/components/layout/logo";
import { SidebarNav } from "@/components/layout/sidebar-nav";

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-sidebar text-sidebar-foreground lg:flex">
      <div className="h-16 shrink-0 border-b flex items-center">
        <Logo />
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <SidebarNav />
      </div>
      <div className="border-t p-4 text-xs text-muted-foreground">
        Fase 1 · Infraestructura
      </div>
    </aside>
  );
}
