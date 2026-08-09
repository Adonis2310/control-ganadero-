"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Laptop, Moon, Sun } from "lucide-react";
import { toast } from "sonner";

import { Label } from "@/components/ui/label";
import { SettingsSection } from "@/features/configuracion/components/settings-section";
import { cn } from "@/lib/utils";

const OPCIONES = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Oscuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Laptop },
] as const;

/**
 * A diferencia de las demás secciones, el tema se aplica y persiste de
 * inmediato al seleccionarlo (mismo mecanismo que el `ThemeToggle` del
 * navbar, vía `next-themes`/localStorage) — "Guardar cambios" solo confirma
 * que la preferencia ya quedó guardada, sin una segunda escritura.
 */
export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <SettingsSection
      title="Apariencia"
      description="Elige cómo se ve la aplicación en este dispositivo."
      onSave={() => toast.success("Configuración actualizada correctamente.")}
      isSaving={false}
    >
      <div className="space-y-2">
        <Label>Tema</Label>
        <div className="grid max-w-md grid-cols-3 gap-3">
          {OPCIONES.map((opcion) => {
            const seleccionado = mounted && theme === opcion.value;
            return (
              <button
                key={opcion.value}
                type="button"
                onClick={() => setTheme(opcion.value)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border p-4 text-sm transition-colors hover:bg-muted/50",
                  seleccionado && "border-primary bg-primary/5",
                )}
              >
                <opcion.icon className="size-5" />
                {opcion.label}
              </button>
            );
          })}
        </div>
      </div>
    </SettingsSection>
  );
}
