import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Intercambia el `code` (flujo PKCE, el que usa `@supabase/ssr` por defecto)
 * por una sesión válida y redirige a `next`. Usado por el enlace de
 * recuperación de contraseña (`resetPasswordForEmail`); queda genérico para
 * poder reutilizarse en cualquier otro flujo de Supabase Auth que devuelva
 * un `code` (confirmación de correo, invitaciones, etc.).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  const redirectUrl = new URL("/login", origin);
  redirectUrl.searchParams.set("error", "auth_callback_failed");
  return NextResponse.redirect(redirectUrl);
}
