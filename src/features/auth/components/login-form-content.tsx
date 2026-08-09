import { Suspense } from "react";

import { LoginForm } from "@/features/auth/components/login-form";

export function LoginFormContent() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Iniciar sesión
      </h1>
      <p className="mt-2 text-sm text-white/80">
        Bienvenido de nuevo, ingresa a tu cuenta para continuar.
      </p>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
