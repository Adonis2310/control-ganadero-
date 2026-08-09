import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export function ResetPasswordContent() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Restablecer contraseña
      </h1>
      <p className="mt-2 text-sm text-white/80">
        Elige una nueva contraseña para tu cuenta.
      </p>

      <ResetPasswordForm />
    </div>
  );
}
