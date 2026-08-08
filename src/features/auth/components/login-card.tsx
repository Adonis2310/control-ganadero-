import type { ReactNode } from "react";

interface LoginPanelProps {
  children: ReactNode;
}

/**
 * Panel de login: una forma orgánica FLOTANTE sobre la fotografía (no una
 * columna que toque los bordes). Todas las esquinas están redondeadas y el
 * borde izquierdo se recorta con una sola curva suave que "entra" en la
 * foto, en vez de una línea recta. Se usa `filter: drop-shadow` (no
 * `box-shadow`) porque es el único que sigue la silueta recortada por
 * `clip-path` en vez de la caja rectangular del elemento.
 */
export function LoginPanel({ children }: LoginPanelProps) {
  return (
    <div className="absolute top-[30px] right-[30px] bottom-[30px] z-10 w-[38%] min-w-[380px] [filter:drop-shadow(0_20px_60px_rgba(30,35,20,0.12))]">
      <svg width="0" height="0" className="absolute">
        <defs>
          <clipPath id="login-organic-clip" clipPathUnits="objectBoundingBox">
            <path d="M0.14,0 L0.91,0 C0.96,0 1,0.03 1,0.065 L1,0.935 C1,0.97 0.96,1 0.91,1 L0.14,1 C0.08,1 0.01,0.94 0.01,0.86 C0.01,0.74 -0.11,0.66 -0.11,0.5 C-0.11,0.34 0.01,0.26 0.01,0.14 C0.01,0.06 0.08,0 0.14,0 Z" />
          </clipPath>
        </defs>
      </svg>

      <div className="flex h-full w-full items-center justify-center bg-[#F7F5ED] [clip-path:url(#login-organic-clip)] dark:bg-[#1c2016]">
        {children}
      </div>
    </div>
  );
}
