"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";

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
      // No revelamos si el correo existe o no (sección 20 de la Fase 13): el
      // mensaje es el mismo tanto si Supabase envía el enlace como si el
      // correo no está registrado.
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
      <div className="mt-7 flex flex-col items-center gap-4 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-white/15">
          <CheckCircle2 className="size-6 text-[#9fdb87]" />
        </div>
        <p className="text-sm text-white/90">{MENSAJE_CONFIRMACION}</p>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white transition-colors hover:text-white/80"
        >
          <ArrowLeft className="size-3.5" />
          Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-7 space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-white/90">
          Correo electrónico
        </Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="admin@mifinca.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="h-[52px] rounded-2xl border border-white/30 bg-white/10 pr-11 pl-4 text-white placeholder:text-white/60 focus-visible:border-white/60 focus-visible:ring-white/25"
          />
          <Mail className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-white/70" />
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-200">
          {error}
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
            Enviando enlace...
          </>
        ) : (
          "Enviar enlace"
        )}
      </Button>

      <div className="flex justify-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-white/75 transition-colors hover:text-white"
        >
          <ArrowLeft className="size-3.5" />
          Volver al inicio de sesión
        </Link>
      </div>
    </form>
  );
}
