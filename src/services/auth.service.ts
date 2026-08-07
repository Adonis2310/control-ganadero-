import { createClient as createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { AuthCredentials } from "@/features/auth/types";

/**
 * Capa de servicio de autenticación para Client Components. Aísla las
 * llamadas directas al SDK de Supabase para que los componentes no dependan
 * de su API interna. La obtención de usuario en servidor se hace con
 * `@/lib/supabase/server` directamente (Server Components/Route Handlers).
 */
export const authService = {
  async signInWithPassword({ email, password }: AuthCredentials) {
    const supabase = createBrowserSupabaseClient();
    return supabase.auth.signInWithPassword({ email, password });
  },

  async signOut() {
    const supabase = createBrowserSupabaseClient();
    return supabase.auth.signOut();
  },
};
