import { Logo } from "@/components/layout/logo";
import { SidebarNav } from "@/components/layout/sidebar-nav";

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/40 bg-sidebar text-sidebar-foreground backdrop-blur-xl lg:flex dark:border-white/10 print:hidden">
      <div className="flex h-16 shrink-0 items-center border-b border-white/40 dark:border-white/10">
        <Logo />
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <SidebarNav />
      </div>
    </aside>
  );
}
