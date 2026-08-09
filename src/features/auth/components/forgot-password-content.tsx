import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export function ForgotPasswordContent() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Recuperar contraseña
      </h1>
      <p className="mt-2 text-sm text-white/80">
        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
      </p>

      <ForgotPasswordForm />
    </div>
  );
}
