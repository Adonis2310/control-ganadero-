import { CattleIcon } from "@/components/shared/cattle-icon";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export function ForgotPasswordContent() {
  return (
    <div className="mx-auto w-[82%] max-w-[380px]">
      <div className="flex size-16 items-center justify-center rounded-full bg-[#e8eadc] dark:bg-white/10">
        <CattleIcon className="size-8 text-[#35421f] dark:text-emerald-300" />
      </div>

      <h2 className="mt-6 text-2xl font-bold tracking-tight text-[#29321c] sm:text-3xl dark:text-white">
        Recuperar contraseña
      </h2>
      <p className="mt-2 text-sm text-[#73756d] dark:text-white/60">
        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
      </p>

      <ForgotPasswordForm />
    </div>
  );
}
