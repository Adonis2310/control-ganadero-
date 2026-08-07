"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_ITEMS } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SidebarNavProps {
  onNavigate?: () => void;
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-3">
      {NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon className="size-4 shrink-0" />
            <span className="flex-1 truncate">{item.title}</span>
            {item.comingSoon && (
              <Badge
                variant="outline"
                className={cn(
                  "px-1.5 py-0 text-[10px] font-normal",
                  isActive && "border-primary-foreground/40 text-primary-foreground",
                )}
              >
                Pronto
              </Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
