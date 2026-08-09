import type { ReactNode } from "react";

import { HERO_IMAGE_URL } from "@/lib/constants/hero-image";

interface AuthShellProps {
  children: ReactNode;
}

/**
 * Envoltorio visual compartido por las pantallas de autenticación (login,
 * recuperar contraseña, restablecer contraseña): fotografía a pantalla
 * completa + una única tarjeta glassmorphism centrada. Reemplaza por
 * completo el panel orgánico anterior (rediseño solicitado explícitamente
 * sobre el login, con una imagen de referencia exacta).
 *
 * Una sola composición para todos los tamaños (no dos ramas desktop/mobile
 * como el diseño anterior): la tarjeta tiene un ancho máximo fijo y se
 * mantiene centrada tanto en teléfono como en pantallas grandes, que es
 * justamente el patrón de la referencia.
 */
export function AuthShell({ children }: AuthShellProps) {
  return (
    <div
      className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#1a2416] p-5"
      style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
    >
      {/* Fondo: fotografía a pantalla completa, sin repetir, cubriendo todo el viewport. */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_IMAGE_URL})` }}
      />
      {/* Oscurecimiento ligero para que la tarjeta y su texto sean legibles sobre cualquier foto. */}
      <div className="absolute inset-0 bg-black/25" />

      {/* Tarjeta glassmorphism: fondo semitransparente, sin blur de la propia tarjeta hacia el contenido (backdrop-blur difumina lo que hay DETRÁS), borde blanco sutil, esquinas grandes. */}
      <div className="relative z-10 w-full max-w-[420px] rounded-[28px] border border-white/25 bg-white/12 p-6 shadow-[0_8px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-8">
        {children}
      </div>
    </div>
  );
}
