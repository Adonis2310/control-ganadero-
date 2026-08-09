import type { Metadata } from "next";

import { AuthShell } from "@/features/auth/components/auth-shell";
import { LoginFormContent } from "@/features/auth/components/login-form-content";

export const metadata: Metadata = {
  title: "Iniciar sesión | Control Ganadero",
};

export default function LoginPage() {
  return (
    <AuthShell>
      <LoginFormContent />
    </AuthShell>
  );
}
