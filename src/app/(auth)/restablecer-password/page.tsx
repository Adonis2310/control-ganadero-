import type { Metadata } from "next";

import { AuthShell } from "@/features/auth/components/auth-shell";
import { ResetPasswordContent } from "@/features/auth/components/reset-password-content";

export const metadata: Metadata = {
  title: "Restablecer contraseña | Control Ganadero",
};

export default function RestablecerPasswordPage() {
  return (
    <AuthShell>
      <ResetPasswordContent />
    </AuthShell>
  );
}
