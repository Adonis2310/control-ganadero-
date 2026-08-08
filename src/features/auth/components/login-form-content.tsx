import { Suspense } from "react";

import { CattleIcon } from "@/components/shared/cattle-icon";
import { LoginForm } from "@/features/auth/components/login-form";

export function LoginFormContent() {
  return (
    <div className="mx-auto w-[82%] max-w-[380px]">
      <div className="flex size-16 items-center justify-center rounded-full bg-[#e8eadc] dark:bg-white/10">
        <CattleIcon className="size-8 text-[#35421f] dark:text-emerald-300" />
      </div>

      <h2 className="mt-6 text-3xl font-bold tracking-tight text-[#29321c] dark:text-white">
        Bienvenido de nuevo
      </h2>
      <p className="mt-2 text-sm text-[#73756d] dark:text-white/60">
        Ingresa con tu cuenta de administrador para continuar.
      </p>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
