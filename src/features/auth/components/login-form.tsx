"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAuthErrorMessage } from "@/features/auth/utils/auth-error.utils";
import { authService } from "@/services/auth.service";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { error: signInError } = await authService.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(getAuthErrorMessage(signInError));
        setIsSubmitting(false);
        return;
      }
    } catch {
      setError("No pudimos conectar con el servidor. Intenta nuevamente.");
      setIsSubmitting(false);
      return;
    }

    const redirectedFrom = searchParams.get("redirectedFrom");
    router.push(redirectedFrom || "/dashboard");
    router.refresh();
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
            className="h-[50px] rounded-2xl border-transparent bg-[#E8EEF9] pl-11 text-[#29321c] placeholder:text-[#73756d]/70 focus-visible:ring-[#35421f]/30 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-[#29321c] dark:text-white">
          Contraseña
        </Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[#73756d] dark:text-white/50" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="h-[50px] rounded-2xl border-transparent bg-[#E8EEF9] px-11 text-[#29321c] placeholder:text-[#73756d]/70 focus-visible:ring-[#35421f]/30 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
            className="absolute top-1/2 right-4 -translate-y-1/2 text-[#73756d] transition-colors hover:text-[#29321c] dark:text-white/50 dark:hover:text-white"
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <Link
          href="/recuperar-password"
          className="text-xs font-medium text-[#73756d] transition-colors hover:text-[#29321c] dark:text-white/60 dark:hover:text-white"
        >
          ¿Olvidaste tu contraseña?
        </Link>
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
            Iniciando sesión...
          </>
        ) : (
          <>
            <ArrowRight className="size-4" />
            Iniciar sesión
          </>
        )}
      </Button>
    </form>
  );
}
