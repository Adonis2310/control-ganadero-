"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/auth.service";

const MENSAJE_CONFIRMACION = "Si el correo está registrado, recibirás instrucciones para recuperar tu contraseña.";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // No revelamos si el correo existe o no (sección 20): el mensaje es el
      // mismo tanto si Supabase envía el enlace como si el correo no está
      // registrado.
      await authService.resetPasswordForEmail(email);
      setEnviado(true);
    } catch {
      setError("No pudimos conectar con el servidor. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (enviado) {
    return (
      <div className="mt-8 flex flex-col items-center gap-4 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-[#e8eadc] dark:bg-white/10">
          <CheckCircle2 className="size-6 text-[#35421f] dark:text-emerald-300" />
        </div>
        <p className="text-sm text-[#29321c] dark:text-white">{MENSAJE_CONFIRMACION}</p>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#35421f] hover:underline dark:text-emerald-300"
        >
          <ArrowLeft className="size-3.5" />
          Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-[#29321c] dark:text-white">
          Correo electrónico
        </Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[#73756d] dark:text-white/50" />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="admin@mifinca.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="h-[50px] rounded-2xl border-transparent bg-[#E8EEF9] pl-11 text-[#29321c] placeholder:text-[#5c5e54] focus-visible:ring-[#35421f]/30 dark:bg-white/5 dark:text-white dark:placeholder:text-white/55"
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
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
            Enviando enlace...
          </>
        ) : (
          <>
            <ArrowRight className="size-4" />
            Enviar enlace
          </>
        )}
      </Button>

      <div className="flex justify-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#565850] transition-colors hover:text-[#29321c] dark:text-white/75 dark:hover:text-white"
        >
          <ArrowLeft className="size-3.5" />
          Volver al inicio de sesión
        </Link>
      </div>
    </form>
  );
}
