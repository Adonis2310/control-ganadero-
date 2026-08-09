"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Eye, EyeOff, Loader2, Lock } from "lucide-react";

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

const GLASS_INPUT =
  "h-[52px] rounded-2xl border border-white/30 bg-white/10 pr-11 pl-4 text-white placeholder:text-white/60 focus-visible:border-white/60 focus-visible:ring-white/25";

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
      setActualizada(true);
    } catch {
      setErrorGeneral("No pudimos conectar con el servidor. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (actualizada) {
    return (
      <div className="mt-7 flex flex-col items-center gap-4 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-white/15">
          <CheckCircle2 className="size-6 text-[#9fdb87]" />
        </div>
        <p className="text-sm text-white/90">Contraseña actualizada correctamente.</p>
        <Button
          onClick={() => router.push("/login")}
          className="h-[52px] w-full rounded-2xl bg-gradient-to-r from-[#9fdb87] to-[#3f6b2f] text-base font-semibold text-white shadow-[0_6px_20px_rgba(63,107,47,0.4)] transition-all duration-200 hover:brightness-105 active:brightness-95"
        >
          Ir al inicio de sesión
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-7 space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-white/90">
          Nueva contraseña
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="••••••••"
            value={values.password}
            onChange={(event) => updateField("password", event.target.value)}
            required
            aria-invalid={Boolean(errors.password)}
            className={GLASS_INPUT}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute top-1/2 right-4 -translate-y-1/2 text-white/70 transition-colors hover:text-white"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-200">{errors.password}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword" className="text-white/90">
          Confirmar nueva contraseña
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="••••••••"
            value={values.confirmPassword}
            onChange={(event) => updateField("confirmPassword", event.target.value)}
            required
            aria-invalid={Boolean(errors.confirmPassword)}
            className={GLASS_INPUT}
          />
          <Lock className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-white/70" />
        </div>
        {errors.confirmPassword && <p className="text-xs text-red-200">{errors.confirmPassword}</p>}
      </div>

      {errorGeneral && (
        <p role="alert" className="text-sm text-red-200">
          {errorGeneral}
        </p>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-[52px] w-full rounded-2xl bg-gradient-to-r from-[#9fdb87] to-[#3f6b2f] text-base font-semibold text-white shadow-[0_6px_20px_rgba(63,107,47,0.4)] transition-all duration-200 hover:brightness-105 active:brightness-95"
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
        <Link href="/login" className="text-xs font-medium text-white/75 transition-colors hover:text-white">
          Volver al inicio de sesión
        </Link>
      </div>
    </form>
  );
}
