import type { Metadata } from "next";

import { CattleIcon } from "@/components/shared/cattle-icon";
import { LoginFormContent } from "@/features/auth/components/login-form-content";
import { LoginHero } from "@/features/auth/components/login-hero";
import { LoginPanel } from "@/features/auth/components/login-card";
import { FARM_NAME } from "@/lib/constants/farm";
import { HERO_IMAGE_URL } from "@/lib/constants/hero-image";

export const metadata: Metadata = {
  title: "Iniciar sesión | Control Ganadero",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-[#f4f1e8] p-3 sm:p-4 dark:bg-[#14150f]">
      {/* Desktop / tablet: composición única, foto + panel orgánico */}
      <div className="relative hidden h-[90vh] min-h-[650px] w-[92vw] max-w-[1450px] overflow-hidden rounded-[40px] shadow-[0_25px_80px_rgba(40,45,20,0.15)] lg:block dark:shadow-[0_25px_80px_rgba(0,0,0,0.4)]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMAGE_URL})` }}
        />
        <div className="absolute inset-0 bg-black/5 dark:bg-black/25" />

        <LoginHero />

        <LoginPanel>
          <LoginFormContent />
        </LoginPanel>
      </div>

      {/* Mobile: apilado, sin la curva orgánica */}
      <div className="flex w-full max-w-md flex-col overflow-hidden rounded-[32px] shadow-[0_20px_60px_rgba(40,45,20,0.15)] lg:hidden dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
        <div
          className="relative h-[38vh] min-h-[220px] bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMAGE_URL})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/5 to-transparent dark:from-black/50 dark:via-black/15" />

          <div className="relative z-10 flex h-full flex-col justify-between p-5">
            <div className="flex items-center gap-2">
              <CattleIcon className="size-6 text-white" />
              <div className="leading-tight">
                <p className="text-sm font-semibold text-white">
                  {FARM_NAME}
                </p>
                <p className="text-[11px] font-medium text-white/75">
                  Sistema de Gestión Ganadera
                </p>
              </div>
            </div>

            <h1 className="text-3xl leading-[1.05] font-bold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.3)]">
              Gestiona tu ganado, impulsa{" "}
              <span className="text-[#73d8a4]">tu finca.</span>
            </h1>
          </div>
        </div>

        <div className="flex-1 bg-[#F7F5ED] px-6 py-8 dark:bg-[#1c2016]">
          <LoginFormContent />
        </div>
      </div>
    </div>
  );
}
