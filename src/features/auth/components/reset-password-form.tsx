"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  EMPTY_RESET_PASSWORD_FORM,
  validateResetPasswordForm,
  type ResetPasswordFormErrors,
  type ResetPasswordFormValues,
} from "@/features/auth/validations/reset-password.schema";
import { authService } from "@/services/auth.service";

export function ResetPasswordForm() {
  const router = useRouter();
  const [values, setValues] = useState<ResetPasswordFormValues>(EMPTY_RESET_PASSWORD_FORM);
  const [errors, setErrors] = useState<ResetPasswordFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actualizada, setActualizada] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  function updateField<K extends keyof ResetPasswordFormValues>(key: K, value: ResetPasswordFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorGeneral(null);

    const fieldErrors = validateResetPasswordForm(values);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await authService.updatePassword(values.password);
      if (error) {
        setErrorGeneral(
          "No pudimos actualizar tu contraseña. El enlace puede haber expirado; solicita uno nuevo.",
        );
        setIsSubmitting(false);
        return;
      }
      toast.success("Contraseña actualizada correctamente.");
      setActualizada(true);
    } catch {
      setErrorGeneral("No pudimos conectar con el servidor. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (actualizada) {
    return (
      <div className="mt-8 flex flex-col items-center gap-4 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-[#e8eadc] dark:bg-white/10">
          <CheckCircle2 className="size-6 text-[#35421f] dark:text-emerald-300" />
        </div>
        <p className="text-sm text-[#29321c] dark:text-white">Contraseña actualizada correctamente.</p>
        <Button
          onClick={() => router.push("/login")}
          className="h-[50px] w-full rounded-full bg-[#35421f] text-white transition-all duration-200 hover:bg-[#46572a] dark:bg-emerald-700 dark:hover:bg-emerald-600"
        >
          Ir al inicio de sesión
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-4 lg:mt-8">
      <div className="space-y-2">
        <Label htmlFor="password" className="text-[#29321c] dark:text-white">
          Nueva contraseña
        </Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[#73756d] dark:text-white/50" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="••••••••"
            value={values.password}
            onChange={(event) => updateField("password", event.target.value)}
            required
            aria-invalid={Boolean(errors.password)}
            className="h-[50px] rounded-2xl border-transparent bg-[#E8EEF9] px-11 text-[#29321c] placeholder:text-[#5c5e54] focus-visible:ring-[#35421f]/30 dark:bg-white/5 dark:text-white dark:placeholder:text-white/55"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute top-1/2 right-4 -translate-y-1/2 text-[#73756d] transition-colors hover:text-[#29321c] dark:text-white/50 dark:hover:text-white"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-600 dark:text-red-400">{errors.password}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-[#29321c] dark:text-white">
          Confirmar nueva contraseña
        </Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[#73756d] dark:text-white/50" />
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="••••••••"
            value={values.confirmPassword}
            onChange={(event) => updateField("confirmPassword", event.target.value)}
            required
            aria-invalid={Boolean(errors.confirmPassword)}
            className="h-[50px] rounded-2xl border-transparent bg-[#E8EEF9] px-11 text-[#29321c] placeholder:text-[#5c5e54] focus-visible:ring-[#35421f]/30 dark:bg-white/5 dark:text-white dark:placeholder:text-white/55"
          />
        </div>
        {errors.confirmPassword && <p className="text-xs text-red-600 dark:text-red-400">{errors.confirmPassword}</p>}
      </div>

      {errorGeneral && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {errorGeneral}
        </p>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-[50px] w-full rounded-full bg-[#35421f] text-white transition-all duration-200 hover:bg-[#46572a] dark:bg-emerald-700 dark:hover:bg-emerald-600"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Actualizando contraseña...
          </>
        ) : (
          "Actualizar contraseña"
        )}
      </Button>

      <div className="flex justify-center">
        <Link
          href="/login"
          className="text-xs font-medium text-[#565850] transition-colors hover:text-[#29321c] dark:text-white/75 dark:hover:text-white"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    </form>
  );
}
