import { CattleIcon } from "@/components/shared/cattle-icon";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export function ResetPasswordContent() {
  return (
    <div className="w-full lg:mx-auto lg:w-[82%] lg:max-w-[380px]">
      <div className="flex size-12 items-center justify-center rounded-full bg-[#e8eadc] lg:size-16 dark:bg-white/10">
        <CattleIcon className="size-6 text-[#35421f] lg:size-8 dark:text-emerald-300" />
      </div>

      <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#29321c] lg:mt-6 lg:text-3xl dark:text-white">
        Restablecer contraseña
      </h2>
      <p className="mt-1.5 text-sm text-[#73756d] lg:mt-2 dark:text-white/60">
        Elige una nueva contraseña para tu cuenta.
      </p>

      <ResetPasswordForm />
    </div>
  );
}
