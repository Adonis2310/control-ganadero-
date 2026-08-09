import type { AuthError } from "@supabase/supabase-js";

/**
 * Traduce un error de Supabase Auth a uno de los mensajes exactos que pide
 * la Fase 13 (sección 20), sin revelar detalles internos. `AuthApiError`
 * (credenciales rechazadas por el servidor) trae un `status` HTTP; los
 * fallos de red (`AuthRetryableFetchError` o una excepción de `fetch`) no,
 * así que ese campo es lo que distingue un caso del otro.
 */
export function getAuthErrorMessage(error: AuthError | Error | null): string {
  if (!error) return "";
  const status = "status" in error ? error.status : undefined;
  if (!status) {
    return "No pudimos conectar con el servidor. Intenta nuevamente.";
  }
  return "Correo o contraseña incorrectos.";
}
