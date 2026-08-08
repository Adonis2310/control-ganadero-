import { Beef } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { obtenerIniciales } from "@/features/ganado/utils/animal.utils";
import { cn } from "@/lib/utils";

interface AnimalAvatarProps {
  fotoUrl: string | null;
  nombre: string | null;
  identificador: string;
  size?: "sm" | "default" | "lg";
  className?: string;
}

const SIZE_CLASS: Record<NonNullable<AnimalAvatarProps["size"]>, string> = {
  sm: "size-8 text-xs",
  default: "size-10 text-sm",
  lg: "size-20 text-xl",
};

export function AnimalAvatar({
  fotoUrl,
  nombre,
  identificador,
  size = "default",
  className,
}: AnimalAvatarProps) {
  return (
    <Avatar className={cn(SIZE_CLASS[size], className)}>
      {fotoUrl && <AvatarImage src={fotoUrl} alt={nombre ?? identificador} />}
      <AvatarFallback>
        {identificador ? (
          obtenerIniciales(nombre, identificador)
        ) : (
          <Beef className="size-1/2 text-muted-foreground" />
        )}
      </AvatarFallback>
    </Avatar>
  );
}
