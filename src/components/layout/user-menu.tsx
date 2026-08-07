"use client";

import { useRouter } from "next/navigation";
import { LogOut, Settings, User as UserIcon } from "lucide-react";
import type { User } from "@supabase/supabase-js";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authService } from "@/services/auth.service";

interface UserMenuProps {
  user: Pick<User, "email"> | null;
}

function getInitials(email: string | null | undefined) {
  if (!email) return "AD";
  return email.slice(0, 2).toUpperCase();
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();

  async function handleSignOut() {
    await authService.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" className="gap-2 px-2" />}
      >
        <Avatar className="size-7">
          <AvatarFallback className="text-xs">
            {getInitials(user?.email)}
          </AvatarFallback>
        </Avatar>
        <span className="hidden max-w-40 truncate text-sm font-medium sm:inline">
          {user?.email ?? "Administrador"}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">
              Administrador
            </span>
            <span className="truncate text-xs font-normal text-muted-foreground">
              {user?.email ?? "Sin sesión"}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem render={<a href="/configuracion" />}>
            <UserIcon />
            Mi perfil
          </DropdownMenuItem>
          <DropdownMenuItem render={<a href="/configuracion" />}>
            <Settings />
            Configuración
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
          <LogOut />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
