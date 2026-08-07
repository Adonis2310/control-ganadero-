import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";

/**
 * Cliente de Supabase para uso en Server Components, Server Actions y Route Handlers.
 * Debe crearse una instancia nueva por request (no se puede reutilizar entre requests).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Se puede ignorar si setAll es invocado desde un Server Component:
            // el middleware ya se encarga de refrescar la sesión en ese caso.
          }
        },
      },
    },
  );
}
