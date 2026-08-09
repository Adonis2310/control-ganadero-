import { CattleIcon } from "@/components/shared/cattle-icon";
import { FARM_NAME } from "@/lib/constants/farm";

/**
 * Contenido superpuesto sobre la fotografía (marca y headline), posicionado
 * de forma absoluta e independiente del panel de login flotante para que la
 * foto se lea como el lienzo completo de la composición, no como una
 * columna separada.
 */
export function LoginHero() {
  return (
    <div className="absolute inset-0 z-10">
      <div className="absolute top-10 left-11 flex items-center gap-2.5">
        <CattleIcon className="size-7 text-white drop-shadow" />
        <div className="leading-tight">
          <p className="text-sm font-semibold text-white drop-shadow-sm">
            {FARM_NAME}
          </p>
          <p className="text-xs font-medium text-white/75">
            Sistema de Gestión Ganadera
          </p>
        </div>
      </div>

      <div className="absolute top-[28%] left-11 max-w-[460px] xl:max-w-[560px]">
        <h1 className="text-4xl leading-[0.95] font-bold tracking-tight text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.25)] lg:text-[44px] xl:text-[52px]">
          Gestiona tu ganado,
          <br />
          impulsa <span className="text-[#8ed17a]">tu finca.</span>
        </h1>
        <p className="mt-7 max-w-[400px] text-sm leading-relaxed text-white/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.25)] xl:max-w-[500px] xl:text-base">
          Control total de tu hato, inventario, salud, producción y más.
          Todo en un solo lugar, diseñado para el productor moderno.
        </p>
      </div>
    </div>
  );
}
