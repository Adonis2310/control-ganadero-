import type { Metadata } from "next";

import { AuthShell } from "@/features/auth/components/auth-shell";
import { ForgotPasswordContent } from "@/features/auth/components/forgot-password-content";

export const metadata: Metadata = {
  title: "Recuperar contraseña | Control Ganadero",
};

export default function RecuperarPasswordPage() {
  return (
    <AuthShell>
      <ForgotPasswordContent />
    </AuthShell>
  );
}
