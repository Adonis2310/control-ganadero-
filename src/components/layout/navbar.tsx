import type { User } from "@supabase/supabase-js";

import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";

interface NavbarProps {
  user: Pick<User, "email"> | null;
}

export function Navbar({ user }: NavbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60 lg:px-6 print:hidden">
      <div className="flex items-center gap-2">
        <MobileSidebar />
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <UserMenu user={user} />
      </div>
    </header>
  );
}
