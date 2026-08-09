"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Eye, EyeOff, Loader2, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAuthErrorMessage } from "@/features/auth/utils/auth-error.utils";
import { authService } from "@/services/auth.service";
import { cn } from "@/lib/utils";

const GLASS_INPUT =
  "h-[52px] rounded-2xl border border-white/30 bg-white/10 pr-11 pl-4 text-white placeholder:text-white/60 focus-visible:border-white/60 focus-visible:ring-white/25";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
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
            className={GLASS_INPUT}
          />
          <User className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-white/70" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-white/90">
          Contraseña
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
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
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={() => setRememberMe((value) => !value)}
          role="checkbox"
          aria-checked={rememberMe}
          className="flex items-center gap-2 text-sm text-white/90"
        >
          <span
            className={cn(
              "flex size-[18px] shrink-0 items-center justify-center rounded-md border transition-colors",
              rememberMe ? "border-[#8ed17a] bg-[#8ed17a]" : "border-white/50 bg-white/10",
            )}
          >
            {rememberMe && <Check className="size-3 text-[#1a2416]" strokeWidth={3} />}
          </span>
          Recordarme
        </button>

        <Link href="/recuperar-password" className="text-xs font-medium text-white/75 transition-colors hover:text-white">
          ¿Olvidaste tu contraseña?
        </Link>
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
            Iniciando sesión...
          </>
        ) : (
          "Iniciar sesión"
        )}
      </Button>
    </form>
  );
}
