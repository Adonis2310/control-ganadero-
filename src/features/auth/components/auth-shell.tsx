import type { ReactNode } from "react";

import { CattleIcon } from "@/components/shared/cattle-icon";
import { LoginHero } from "@/features/auth/components/login-hero";
import { LoginPanel } from "@/features/auth/components/login-card";
import { FARM_NAME } from "@/lib/constants/farm";
import { HERO_IMAGE_URL } from "@/lib/constants/hero-image";

interface AuthShellProps {
  children: ReactNode;
}

/**
 * Envoltorio visual compartido por las pantallas de autenticación (login,
 * recuperar contraseña, restablecer contraseña): misma foto de fondo, mismo
 * panel orgánico flotante en escritorio y una composición apilada dedicada
 * para móvil (sección 3 de la Fase 13: mantener el lenguaje visual actual;
 * auditoría posterior: rediseñar SOLO la composición <lg, sin tocar
 * desktop). Extraído para no duplicar este marcado en cada pantalla nueva.
 */
export function AuthShell({ children }: AuthShellProps) {
  return (
    <div
      className="flex min-h-svh items-center justify-center bg-[#f4f1e8] p-3 sm:p-4 dark:bg-[#14150f]"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      {/* Desktop / tablet grande: composición única, foto + panel orgánico. Sin cambios respecto al diseño original. */}
      <div className="relative hidden h-[90vh] min-h-[650px] w-[92vw] max-w-[1450px] overflow-hidden rounded-[40px] shadow-[0_25px_80px_rgba(40,45,20,0.15)] lg:block dark:shadow-[0_25px_80px_rgba(0,0,0,0.4)]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMAGE_URL})` }}
        />
        <div className="absolute inset-0 bg-black/5 dark:bg-black/25" />

        <LoginHero />

        <LoginPanel>{children}</LoginPanel>
      </div>

      {/*
        Móvil/tablet chica: composición apilada e independiente, no una
        versión reducida del panel de escritorio.
        - Alto del hero fluido con `clamp()` sobre `dvh` (viewport dinámico:
          se ajusta cuando Safari muestra/oculta la barra de direcciones),
          nunca `vh` a secas -- así no queda desalineado con el `min-h-svh`
          del contenedor raíz.
        - Nada de alturas fijas en el resto: la tarjeta crece con su
          contenido: si no cabe, la página hace scroll normal, no se recorta.
      */}
      <div className="flex w-full max-w-md flex-col overflow-hidden rounded-[28px] shadow-[0_20px_60px_rgba(40,45,20,0.15)] lg:hidden dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
        <div
          className="relative h-[clamp(220px,30dvh,280px)] shrink-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMAGE_URL})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent dark:from-black/65 dark:via-black/20" />

          <div className="relative z-10 flex h-full flex-col justify-between p-4">
            <div className="flex items-center gap-2">
              <CattleIcon className="size-5 text-white" />
              <div className="leading-tight">
                <p className="text-xs font-semibold text-white">
                  {FARM_NAME}
                </p>
                <p className="text-[10px] font-medium text-white/75">
                  Sistema de Gestión Ganadera
                </p>
              </div>
            </div>

            <h1 className="text-[clamp(1.375rem,6vw,1.75rem)] leading-[1.1] font-bold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
              Gestiona tu ganado, impulsa{" "}
              <span className="text-[#8ed17a]">tu finca.</span>
            </h1>
          </div>
        </div>

        <div className="bg-[#F7F5ED] px-5 py-6 dark:bg-[#1c2016]">
          {children}
        </div>
      </div>
    </div>
  );
}
